import type { ModuleId } from '../../shared/contracts.js';

export type EvidenceLevel = '強' | '中' | '補助';

export interface EvidenceWarmup {
  id: string;
  title: string;
  durationLabel: string;
  evidenceLevel: EvidenceLevel;
  summary: string;
  whyItWorks: string;
  steps: string[];
  focusTemplate: string;
  sourceNote: string;
}

const warmupsByModule: Record<Exclude<ModuleId, 'session-review-dashboard'>, EvidenceWarmup[]> = {
  'baseline-assessor': [
    {
      id: 'baseline-self-explanation',
      title: '自己説明プロンプト',
      durationLabel: '5分',
      evidenceLevel: '強',
      summary: '回答前後に、結論・根拠・次の一手を自分で説明し直して論理の抜けを潰します。',
      whyItWorks: '自己説明は説明の筋道を明確にし、理解の浅い部分を浮かび上がらせやすい訓練です。',
      steps: [
        '答える前に、結論を1文で言う。',
        'その結論を支える根拠を2点だけ言う。',
        '最後に、相手に必要な次の一手を1文で言う。',
      ],
      focusTemplate: '結論・根拠・次の一手を明確に分け、理由まで言い切る。',
      sourceNote: 'Bisra らの自己説明メタ分析 / Dunlosky らの学習技法レビュー',
    },
    {
      id: 'baseline-video-review',
      title: '具体観点つきセルフレビュー',
      durationLabel: '10分',
      evidenceLevel: '中',
      summary: '録音後に「最初の1文」「理由」「次アクション」の3点だけを見返し、曖昧さを行動単位で修正します。',
      whyItWorks: '行動単位の具体フィードバックは、話し方の癖修正と再現性向上に向いています。',
      steps: [
        '録音を聞き返し、最初の1文で結論を言えたか確認する。',
        '理由と影響が混ざっていないか確認する。',
        '次回直す点を1つだけ決める。',
      ],
      focusTemplate: '最初の1文で結論を置き、理由と次アクションを分ける。',
      sourceNote: '具体フィードバックと video-based feedback の研究',
    },
  ],
  'rapid-response-drill': [
    {
      id: 'rapid-retrieval',
      title: '30秒想起練習',
      durationLabel: '5分',
      evidenceLevel: '強',
      summary: '型を見ずに口頭で思い出し、即答時の初動を速くします。',
      whyItWorks: 'practice testing は「見れば分かる」を「すぐ出せる」に変えやすく、即答の反射に効きます。',
      steps: [
        '結論先行の型を見ずに30秒で言う。',
        '言えなかった部分だけメモする。',
        '同じ型をもう1回だけやり直す。',
      ],
      focusTemplate: '一言目で結論を置き、30秒以内に状況と次アクションまで言う。',
      sourceNote: 'Dunlosky らの practice testing / distributed practice レビュー',
    },
    {
      id: 'rapid-if-then',
      title: 'If-Then 即答プラン',
      durationLabel: '3分',
      evidenceLevel: '強',
      summary: '急に振られた場面を想定し、最初の一手を事前に固定します。',
      whyItWorks: 'implementation intentions は、場面が来た瞬間の行動起動を助けやすい手法です。',
      steps: [
        '「もし急に進捗を聞かれたら」を書く。',
        '最初の1文を固定する。',
        'その後に続ける理由1つと次アクション1つを決める。',
      ],
      focusTemplate: 'もし急に振られたら、最初に結論を1文で言い、その後に現状と次アクションを続ける。',
      sourceNote: 'Gollwitzer & Sheeran / MCII メタ分析',
    },
    {
      id: 'rapid-distributed',
      title: '分散リピート設計',
      durationLabel: '2分',
      evidenceLevel: '強',
      summary: '同じシナリオを今だけで終わらせず、2〜3日後に再挑戦する前提を先に作ります。',
      whyItWorks: '分散練習は詰め込みより保持と再現性に優れやすく、即答の安定化に向きます。',
      steps: [
        '今日のシナリオ名を控える。',
        '48時間以内に同じ型を再試行すると決める。',
        '再試行時に見る指標を1つ決める。',
      ],
      focusTemplate: '今回の型を再現可能にするため、同じ構造で短く言い切る。',
      sourceNote: 'Dunlosky らの distributed practice レビュー',
    },
  ],
  'pressure-defense-simulator': [
    {
      id: 'pressure-breathing',
      title: '低速呼吸リセット',
      durationLabel: '3分',
      evidenceLevel: '中',
      summary: '録音前に呼吸を落として、圧がかかった場面でも声と論点を崩れにくくします。',
      whyItWorks: '単回の slow breathing はストレス前の生理的 arousal を抑える補助として有効です。',
      steps: [
        '4秒で吸う。',
        '6秒で吐く。',
        '10〜12呼吸を目安に繰り返す。',
      ],
      focusTemplate: '圧がかかっても速度を上げすぎず、事実・解釈・次の確認を分けて答える。',
      sourceNote: 'Wells らの slow breathing RCT',
    },
    {
      id: 'pressure-if-then',
      title: '詰め対応 If-Then',
      durationLabel: '3分',
      evidenceLevel: '強',
      summary: '責められたときの初手を「事実から入る」に固定して、感情に引っ張られにくくします。',
      whyItWorks: '事前に言い出しを決めると、圧が高い場面での応答の立ち上がりが安定しやすくなります。',
      steps: [
        '「もし原因を強く詰められたら」と書く。',
        '「まず事実を申し上げます」で始める。',
        '次に現時点の解釈と不足情報を続ける。',
      ],
      focusTemplate: 'もし原因を詰められたら、まず事実を示し、次に解釈と不足情報を分けて答える。',
      sourceNote: 'Implementation intentions のメタ分析',
    },
    {
      id: 'pressure-self-explanation',
      title: '再着地の自己説明',
      durationLabel: '4分',
      evidenceLevel: '強',
      summary: '答えた後に「守る主張」と「引ける主張」を説明し直し、論点維持を鍛えます。',
      whyItWorks: '自己説明は論理の穴を見つけやすく、守る論点の整理に向いています。',
      steps: [
        '今の回答で守る主張を1つ言う。',
        'まだ断定しない点を1つ言う。',
        '最後に是正策を1文で言う。',
      ],
      focusTemplate: '守る主張を1つに絞り、断定しない点は明示しつつ是正策で締める。',
      sourceNote: '自己説明メタ分析',
    },
  ],
  'persuasion-lab': [
    {
      id: 'persuasion-perspective',
      title: '視点取得プロンプト',
      durationLabel: '5分',
      evidenceLevel: '中',
      summary: '提案前に相手の関心と避けたい損失を書き出し、相手視点で説明の順序を調整します。',
      whyItWorks: 'perspective taking は交渉や説得準備で、相手の利害に合う説明を組み立てやすくします。',
      steps: [
        '相手の第一関心を書く。',
        '相手が避けたい損失を書く。',
        'その関心に合わせて、提案の最初の1文を作る。',
      ],
      focusTemplate: '相手の第一関心から入り、懸念を先に要約してから提案を置く。',
      sourceNote: 'Galinsky ら / Trötschel らの perspective-taking 研究',
    },
    {
      id: 'persuasion-self-explanation',
      title: '提案の自己説明',
      durationLabel: '5分',
      evidenceLevel: '強',
      summary: '提案の価値とリスク対応を自分の言葉で説明し直し、説得の骨格を固めます。',
      whyItWorks: '自己説明は理由の弱さや因果の飛びを見つけやすく、提案の納得感向上に使えます。',
      steps: [
        '提案の利益を1文で言う。',
        '懸念への対応を1文で言う。',
        '合意したい次ステップを1文で言う。',
      ],
      focusTemplate: '相手の利益、懸念への対応、次ステップの順で短く提案する。',
      sourceNote: '自己説明メタ分析',
    },
    {
      id: 'persuasion-if-then',
      title: '反論対応 If-Then',
      durationLabel: '3分',
      evidenceLevel: '強',
      summary: '反対されたときに、すぐ再反論せず相手の懸念を先に要約する動きを固定します。',
      whyItWorks: 'If-Then は高圧・高認知負荷の場面での初手の質を揃えるのに向いています。',
      steps: [
        '「もし反対されたら」と書く。',
        '「懸念は二つあると理解しました」で始める。',
        'その後に対応策と代替案を1つずつ言う。',
      ],
      focusTemplate: 'もし反対されたら、先に懸念を要約し、その後に対応策と代替案を出す。',
      sourceNote: 'Implementation intentions のメタ分析',
    },
  ],
};

export function getWarmupsForModule(moduleId: ModuleId) {
  if (moduleId === 'session-review-dashboard') {
    return [];
  }

  return warmupsByModule[moduleId];
}
