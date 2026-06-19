// config.js - TaskMind 定数・設定

// ノードタイプ定義
const NODE_TYPES = {
    TASK: 'task',
    SCHEDULE: 'schedule',
    DAILY: 'daily',
    MONTHLY: 'monthly',
    CONDITION: 'condition',
    MEMO: 'memo',
    START_END: 'startend'
};

// ノードタイプ表示設定
const NODE_TYPE_CONFIG = {
    [NODE_TYPES.TASK]: { label: 'タスク', icon: '' },
    [NODE_TYPES.SCHEDULE]: { label: '予定', icon: '📅' },
    [NODE_TYPES.DAILY]: { label: '毎日', icon: '📆' },
    [NODE_TYPES.MONTHLY]: { label: '毎月', icon: '📅' },
    [NODE_TYPES.CONDITION]: { label: '条件', icon: '❓' },
    [NODE_TYPES.MEMO]: { label: 'メモ', icon: '📝' },
    [NODE_TYPES.START_END]: { label: '開始/終了', icon: '🏁' }
};

// デフォルト色リスト
const DEFAULT_COLORS = [
    '#e57373', '#f06292', '#ba68c8', '#9575cd', '#7986cb',
    '#64b5f6', '#4fc3f7', '#4dd0e1', '#4db6ac', '#81c784',
    '#aed581', '#dce775', '#fff176', '#ffd54f', '#ffb74d',
    '#ff8a65', '#a1887f', '#e0e0e0'
];

// 接続タイプ（デフォルト）
const DEFAULT_CONNECTION_TYPES = [
    { label: 'なぜ？', color: '#e74c3c', icon: '🔍' },
    { label: 'どうやって？', color: '#3498db', icon: '🔧' },
    { label: 'しかし', color: '#e67e22', icon: '⚠️' },
    { label: 'つまり', color: '#2ecc71', icon: '✅' },
    { label: '代わりに', color: '#9b59b6', icon: '🔀' },
    { label: 'ただし', color: '#f39c12', icon: '❗' },
    { label: 'だから', color: '#e91e63', icon: '➡️' }
];

// タイムライン設定
const TIMELINE_DEFAULTS = {
    viewRange: 'week',
    dayWidth: 120,
    laneHeight: 80,
    expandedLanes: {
        daily: true,
        weekly: true,
        monthly: true,
        yearly: true,
        task: true,
        asap: true
    }
};

// ズーム設定
const ZOOM_CONFIG = {
    min: 0.1,
    max: 3,
    step: 1.2,
    default: 1
};

// タイムラインズーム設定
const TIMELINE_ZOOM_CONFIG = {
    min: 10,
    max: 1000,
    step: 1.5,
    default: 120
};

// ノードデフォルト値
const NODE_DEFAULTS = {
    width: 200,
    height: 100,
    minWidth: 180,
    color: '#e57373'
};

// 優先度設定
const PRIORITY_CONFIG = {
    min: 0,
    max: 5,
    default: 0
};

// レイアウトモード
const LAYOUT_MODES = {
    FREE: 'free',
    TIMELINE: 'timeline'
};

// 選択モード
const MODES = {
    SELECT: 'select',
    PAN: 'pan',
    NODE: 'node',
    CONNECT: 'connect'
};

// キーボードショートカット
const KEYBOARD_SHORTCUTS = {
    'v': MODES.SELECT,
    ' ': MODES.PAN,
    'n': MODES.NODE,
    'c': MODES.CONNECT,
    'Delete': 'delete',
    'Backspace': 'delete',
    'Escape': 'escape',
    'ctrl+s': 'save',
    'ctrl+a': 'selectAll',
    'ctrl+z': 'undo',
    'ctrl+y': 'redo'
};

// ローカルストレージキー
const STORAGE_KEYS = {
    AUTOSAVE: 'taskmind_autosave',
    SETTINGS: 'taskmind_settings'
};

// 通知設定
const NOTIFICATION_CONFIG = {
    warningBeforeMinutes: 5,
    checkIntervalMs: 30000
};

// アニメーション設定
const ANIMATION_CONFIG = {
    blinkDuration: 1000,
    toastDuration: 3000,
    transitionDuration: 200
};

// ドラッグ設定
const DRAG_CONFIG = {
    threshold: 10,
    doubleClickDelay: 300
};
