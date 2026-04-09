import { startTransition, useDeferredValue, useEffect, useRef, useState } from 'react';
import { evaluateSession, fetchBootstrap, fetchHistory, generateSession, uploadAudio } from './api';
import { BaselineSelfCheckPanel } from './components/BaselineSelfCheckPanel.js';
import { EvidenceWarmupsPanel } from './components/EvidenceWarmupsPanel.js';
import { ModuleNav } from './components/ModuleNav.js';
import { PracticeWorkspace } from './components/PracticeWorkspace.js';
import { ProviderPanel } from './components/ProviderPanel.js';
import { ReviewDashboardPanel } from './components/ReviewDashboardPanel.js';
import { usePracticeRecorder } from './hooks/usePracticeRecorder.js';
import {
  buildBaselineAbilities,
  buildBaselineSelfCheck,
  calculateBaselineAverage,
  baselineQuestions,
  loadBaselineDraft,
  saveBaselineDraft,
} from './lib/baseline.js';
import { buildDashboardSnapshot } from './lib/dashboard.js';
import { getWarmupsForModule } from './lib/evidenceWarmups.js';
import type {
  BootstrapData,
  EvaluationResult,
  GeneratedSession,
  ModuleId,
  ProviderId,
  SessionHistoryItem,
} from '../shared/contracts.js';

async function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Failed to convert blob'));
        return;
      }
      resolve(result.split(',')[1] ?? '');
    };
    reader.onerror = () => reject(reader.error ?? new Error('FileReader failed'));
    reader.readAsDataURL(blob);
  });
}

export default function App() {
  const [bootstrap, setBootstrap] = useState<BootstrapData | null>(null);
  const [history, setHistory] = useState<SessionHistoryItem[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<ModuleId>('rapid-response-drill');
  const [selectedProviderId, setSelectedProviderId] = useState<ProviderId>('openai');
  const [selectedScenarioId, setSelectedScenarioId] = useState('');
  const [timeLimitSec, setTimeLimitSec] = useState(45);
  const [customFocus, setCustomFocus] = useState('');
  const [generatedSession, setGeneratedSession] = useState<GeneratedSession | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [selfReview, setSelfReview] = useState('');
  const [audioFileName, setAudioFileName] = useState('');
  const [loadingLabel, setLoadingLabel] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [baselineAnswers, setBaselineAnswers] = useState<Record<string, number>>(() => loadBaselineDraft().answers);
  const [baselineNote, setBaselineNote] = useState(() => loadBaselineDraft().note);

  const sessionReadyAtRef = useRef<number>(0);
  const recordingStartedAtRef = useRef<number>(0);

  const recorder = usePracticeRecorder({
    onError: setErrorMessage,
    onAudioReady: async ({ blob, mimeType }) => {
      if (!generatedSession) {
        return;
      }

      const base64Data = await blobToBase64(blob);
      const uploadResult = await uploadAudio({
        sessionId: generatedSession.sessionId,
        mimeType,
        base64Data,
      });
      setAudioFileName(uploadResult.fileName);
    },
  });

  const deferredTranscript = useDeferredValue(recorder.transcript);
  const baselineAverage = calculateBaselineAverage(baselineAnswers);
  const baselineAbilities = buildBaselineAbilities(baselineAnswers);
  const dashboard = buildDashboardSnapshot(
    history,
    bootstrap?.modules ?? [],
    baselineAverage,
    baselineAbilities,
  );
  const currentModule = bootstrap?.modules.find((module) => module.id === selectedModuleId);
  const currentRubric = bootstrap?.rubrics.find((rubric) => rubric.moduleId === selectedModuleId);
  const currentScenarios = bootstrap?.scenarios.filter((scenario) => scenario.moduleId === selectedModuleId) ?? [];
  const currentWarmups = getWarmupsForModule(selectedModuleId);

  useEffect(() => {
    void (async () => {
      try {
        setLoadingLabel('初期データを読み込んでいます...');
        const [nextBootstrap, nextHistory] = await Promise.all([fetchBootstrap(), fetchHistory()]);
        setBootstrap(nextBootstrap);
        startTransition(() => setHistory(nextHistory));

        const configuredProvider =
          nextBootstrap.providers.find((provider) => provider.configured)?.id ?? nextBootstrap.providers[0]?.id;
        if (configuredProvider) {
          setSelectedProviderId(configuredProvider);
        }
      } catch {
        setErrorMessage('初期データの読み込みに失敗しました。API サーバーが起動しているか確認してください。');
      } finally {
        setLoadingLabel('');
      }
    })();
  }, []);

  useEffect(() => {
    saveBaselineDraft(baselineAnswers, baselineNote);
  }, [baselineAnswers, baselineNote]);

  useEffect(() => {
    if (!bootstrap) {
      return;
    }

    const nextModule = bootstrap.modules.find((module) => module.id === selectedModuleId);
    if (nextModule) {
      setTimeLimitSec(nextModule.defaultTimeLimitSec);
    }

    const scenarioCandidates = bootstrap.scenarios.filter((scenario) => scenario.moduleId === selectedModuleId);
    setSelectedScenarioId(scenarioCandidates[0]?.id ?? '');
    setGeneratedSession(null);
    setEvaluation(null);
    setSelfReview('');
    setAudioFileName('');
    setCustomFocus('');
    recorder.resetRecorderSession();
  }, [bootstrap, selectedModuleId]);

  async function refreshHistory() {
    const nextHistory = await fetchHistory();
    startTransition(() => setHistory(nextHistory));
  }

  async function handleGenerate() {
    if (!bootstrap || selectedModuleId === 'session-review-dashboard') {
      return;
    }

    try {
      setErrorMessage('');
      setLoadingLabel('シナリオとコーチングを生成しています...');
      const result = await generateSession({
        moduleId: selectedModuleId,
        providerId: selectedProviderId,
        scenarioId: selectedScenarioId || undefined,
        customFocus: customFocus || undefined,
        timeLimitSec,
      });
      sessionReadyAtRef.current = Date.now();
      recordingStartedAtRef.current = 0;
      setGeneratedSession(result);
      setEvaluation(null);
      setSelfReview('');
      setAudioFileName('');
      recorder.resetRecorderSession();
    } catch {
      setErrorMessage('シナリオ生成に失敗しました。API サーバーとキー設定を確認してください。');
    } finally {
      setLoadingLabel('');
    }
  }

  async function handleStartRecording() {
    if (!generatedSession) {
      return;
    }

    setErrorMessage('');
    recordingStartedAtRef.current = Date.now();
    setAudioFileName('');
    await recorder.startRecording(generatedSession.timeLimitSec);
  }

  async function handleEvaluate() {
    if (!generatedSession || !recorder.transcript.trim()) {
      return;
    }

    try {
      setErrorMessage('');
      setLoadingLabel('採点とレビューを生成しています...');
      const answerPreparationSec =
        recordingStartedAtRef.current && sessionReadyAtRef.current
          ? Math.max(1, Math.round((recordingStartedAtRef.current - sessionReadyAtRef.current) / 1000))
          : 0;

      const result = await evaluateSession({
        sessionId: generatedSession.sessionId,
        moduleId: generatedSession.moduleId,
        providerId: generatedSession.providerId,
        scenarioId: generatedSession.scenario.id,
        transcript: recorder.transcript,
        selfReview,
        answerPreparationSec,
        audioFileName: audioFileName || undefined,
        baselineSelfCheck:
          generatedSession.moduleId === 'baseline-assessor'
            ? buildBaselineSelfCheck(baselineAnswers, baselineNote)
            : undefined,
      });
      setEvaluation(result);
      await refreshHistory();
    } catch {
      setErrorMessage('採点に失敗しました。文字起こしが空でないか確認してください。');
    } finally {
      setLoadingLabel('');
    }
  }

  function handleApplyWarmupFocus(template: string) {
    setCustomFocus((current) => {
      if (!current.trim()) {
        return template;
      }

      if (current.includes(template)) {
        return current;
      }

      return `${current} / ${template}`;
    });
  }

  return (
    <div className="app-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />

      <header className="hero-panel">
        <div>
          <p className="eyebrow">ExplainerCore</p>
          <h1>説明力と会話力を、訓練可能なプロジェクトにする。</h1>
          <p className="hero-copy">
            会議での即答、厳しい追及への切り返し、説得までを、録音・文字起こし・AI 採点・履歴比較で回します。
          </p>
        </div>

        <div className="hero-stats">
          <div className="stat-card">
            <span>登録モジュール</span>
            <strong>{bootstrap?.modules.length ?? 0}</strong>
          </div>
          <div className="stat-card">
            <span>直近平均</span>
            <strong>{dashboard.recentAverageLabel}</strong>
          </div>
          <div className="stat-card">
            <span>履歴件数</span>
            <strong>{history.length}</strong>
          </div>
        </div>
      </header>

      {bootstrap && (
        <>
          <ProviderPanel
            providers={bootstrap.providers}
            selectedProviderId={selectedProviderId}
            onSelect={setSelectedProviderId}
          />

          <section className="workspace-grid">
            <ModuleNav
              modules={bootstrap.modules}
              selectedModuleId={selectedModuleId}
              onSelect={setSelectedModuleId}
            />

            <main className="workspace-main">
              <section className="module-hero">
                <div>
                  <p className="eyebrow">Current Module</p>
                  <h2>{currentModule?.title ?? 'Loading...'}</h2>
                  <p>{currentModule?.goal}</p>
                </div>
                <div className="pill-list">
                  {currentModule?.primarySkills.map((skill) => (
                    <span key={skill} className="pill">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>

              {selectedModuleId === 'baseline-assessor' && (
                <BaselineSelfCheckPanel
                  baselineAbilities={dashboard.baselineAbilities}
                  baselineAnswers={baselineAnswers}
                  baselineAverage={dashboard.baselineAverage}
                  baselineNote={baselineNote}
                  questions={baselineQuestions}
                  onAnswersChange={(updater) => setBaselineAnswers((current) => updater(current))}
                  onNoteChange={setBaselineNote}
                />
              )}

              {selectedModuleId !== 'session-review-dashboard' && (
                <EvidenceWarmupsPanel
                  warmups={currentWarmups}
                  onApplyFocusTemplate={handleApplyWarmupFocus}
                />
              )}

              {selectedModuleId !== 'session-review-dashboard' && (
                <PracticeWorkspace
                  audioFileName={audioFileName}
                  audioUrl={recorder.audioUrl}
                  currentRubric={currentRubric}
                  currentScenarios={currentScenarios}
                  customFocus={customFocus}
                  deferredTranscriptLength={deferredTranscript.length}
                  elapsedSec={recorder.elapsedSec}
                  evaluation={evaluation}
                  generatedSession={generatedSession}
                  isRecording={recorder.isRecording}
                  loading={Boolean(loadingLabel)}
                  onCustomFocusChange={setCustomFocus}
                  onEvaluate={() => void handleEvaluate()}
                  onGenerate={() => void handleGenerate()}
                  onScenarioChange={setSelectedScenarioId}
                  onSelfReviewChange={setSelfReview}
                  onStartRecording={() => void handleStartRecording()}
                  onStopRecording={() => void recorder.stopRecording()}
                  onTimeLimitChange={setTimeLimitSec}
                  onTranscriptChange={recorder.setTranscript}
                  selectedScenarioId={selectedScenarioId}
                  selfReview={selfReview}
                  timeLimitSec={timeLimitSec}
                  transcript={recorder.transcript}
                />
              )}

              <ReviewDashboardPanel
                history={history}
                latestAverage={dashboard.latestAverage}
                latestThreeCount={dashboard.latestThree.length}
                moduleSummaries={dashboard.moduleSummaries}
                nextRecommendation={dashboard.nextRecommendation}
                previousThreeCount={dashboard.previousThree.length}
                strongestModule={dashboard.strongestModule}
                trendDelta={dashboard.trendDelta}
                weakestModule={dashboard.weakestModule}
              />
            </main>
          </section>
        </>
      )}

      {loadingLabel && <div className="toast">{loadingLabel}</div>}
      {errorMessage && <div className="toast error">{errorMessage}</div>}
    </div>
  );
}
