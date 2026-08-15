import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, BellOff, Check, Download, Loader2, Moon, Pause, Play, RefreshCw, RotateCcw, Settings, Share2, Sparkles, Sun, Volume2, VolumeX, X, Zap } from "lucide-react";

type ModeKey = "mild" | "spicy" | "mala" | "hell";
type Question = [string, string];

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

// Style reminder: Neon Arcade — midnight navy, electric cyan/pink, fast tactile transitions, and phone-like card stacking.
const ASSETS = {
  logo: "/assets/logo.png",
  bgmLobby: "/assets/bgm-lobby.mp3",
  bgmHell: "/assets/bgm-hell.mp3",
};

const APP_VERSION = "1.0.0";

const MODES: Record<ModeKey, { label: string; kicker: string; color: string; questions: Question[] }> = {
  mild: { label: "😌 순한맛", kicker: "찌질하고 황당한 일상", color: "cyan", questions: [
    ["방귀 소리가 매번 비둘기 울음소리로 나기", "비둘기만 보면 내 이름을 크게 외치기"],
    ["걸을 때마다 윈도우 에러음이 나기", "앉을 때마다 박수 소리가 나기"],
    ["샤워 중 매번 30초간 단수되기", "샴푸 거품 낼 때마다 물이 너무 뜨거워지기"],
    ["재채기할 때마다 자동으로 ‘실례합니다’가 재생되기", "하품할 때마다 주변에서 웃음소리가 나기"],
    ["휴대폰 배터리가 7%에서 멈추기", "충전 케이블이 매번 1cm 짧기"],
    ["카페에서 주문할 때마다 목소리가 아기처럼 나오기", "전화 받을 때마다 목소리가 뉴스 앵커처럼 나오기"],
    ["엘리베이터에서 내릴 때마다 혼자 인사하기", "문 열릴 때마다 혼자 박수치기"],
    ["양말 한쪽만 늘 젖어 있기", "신발 안에 작은 모래가 계속 들어 있기"],
    ["집에서 혼자 있을 때 택배 알림이 매시간 울리기", "택배가 올 때마다 문 앞에서 3초간 춤추기"],
    ["웃을 때마다 코에서 작은 삑 소리 나기", "울 때마다 눈물 대신 탄산이 나오기"],
  ]},
  spicy: { label: "🔥 매운맛", kicker: "사회적 수치심 생존전", color: "pink", questions: [
    ["카톡 단톡방에 내 뒷담화가 실수로 유출되기", "내가 쓴 모든 메시지가 인스타 광고로 박제되기"],
    ["전 애인이 내 회사 회식에 매번 등장하기", "상사가 내 모든 흑역사 사진을 보고 있기"],
    ["친구에게 보낼 메시지를 단톡방에 보내기", "상사에게 보낼 메시지를 전 애인에게 보내기"],
    ["소개팅 상대 앞에서 친구가 내 별명을 폭로하기", "친구들 앞에서 상대가 내 검색 기록 읽기"],
    ["인스타 스토리에 올린 셀카가 24시간 광고되기", "검색한 상품이 매일 지인 피드에 뜨기"],
    ["회사 발표 중 PPT 대신 내 메신저 기록이 나오기", "회식 건배사 중 전 애인 이름을 외치기"],
    ["모든 지인이 내 첫사랑 이야기를 알고 있기", "모든 지인이 내 최근 검색어를 알고 있기"],
    ["단톡방에서 나간 순간 다시 초대되기", "읽씹한 사람이 바로 옆자리로 이사 오기"],
    ["친구 결혼식 축사에서 내 흑역사 영상 재생되기", "내 생일 파티에서 상사가 갑자기 사회 보기"],
    ["전 애인의 새 연인과 매일 같은 버스 타기", "상사와 매일 같은 헬스장 러닝머신 쓰기"],
  ]},
  mala: { label: "🌶️ 마라맛", kicker: "뇌절과 기괴한 저주", color: "yellow", questions: [
    ["울 때마다 뱃고동 소리가 나기", "웃을 때마다 기차 경적이 울리기"],
    ["내 뒷담화를 들을 때마다 효과음으로 박수치기", "내가 뒷담화를 할 때마다 자막으로 송출하기"],
    ["머릿속 일기장이 매일 밤 낭독되기", "오늘 한 생각이 다음 날 아침 라디오로 방송되기"],
    ["거울 속 내가 3초 먼저 표정 짓기", "사진 속 내가 3초 늦게 눈 깜빡이기"],
    ["방에 들어갈 때마다 이전 방문자의 마지막 생각 듣기", "방을 나갈 때마다 다음 방문자의 첫 생각 듣기"],
    ["거짓말할 때마다 귀가 빨개지기", "진실을 말할 때마다 손톱이 파래지기"],
    ["모든 음식이 먹히기 전 내 성격 평가하기", "모든 음료가 목을 지나며 한마디 하기"],
    ["내 그림자가 하루 한 번 반대로 움직이기", "내 목소리가 하루 한 번 3초 먼저 대답하기"],
    ["누군가 나를 싫어하면 양말이 뒤집히기", "누군가 나를 좋아하면 신발끈이 풀리기"],
    ["모든 침묵 뒤에 누군가 ‘어색하네요’ 말하기", "대화가 끊길 때마다 어린 시절 영상 재생되기"],
  ]},
  hell: { label: "💀 헬모드", kicker: "정신나간 지옥의 선택", color: "violet", questions: [
    ["숨 쉴 때마다 주변에 한숨 소리가 들리기", "심장 뛸 때마다 지하철 도착음이 나기"],
    ["눈을 깜빡일 때마다 1초간 암전되기", "하품할 때마다 세상이 1초간 느려지기"],
    ["꿈속에서 매일 같은 하루를 무한 반복하기", "현실에서 매일 같은 문장을 무한 반복하기"],
    ["잠들면 꿈속 관객이 내 선택을 평점 매기기", "깨어 있으면 보이지 않는 심사위원이 코멘트하기"],
    ["모든 문이 열릴 때 나에게 사과하기", "모든 의자가 앉기 전에 내 체중을 평가하기"],
    ["자정마다 내 이름으로 정체불명의 택배 오기", "정오마다 내 이름으로 반송 택배 오기"],
    ["내 그림자가 매일 10분간 나를 따라 하지 않기", "내 반사가 매일 10분간 나를 비웃기"],
    ["하루 한 번 모든 사람이 10초간 나를 따라 하기", "하루 한 번 모든 사람이 10초간 나를 무시하기"],
    ["평생 머리 위에 작은 먹구름이 따라다니기", "평생 발밑에 작은 안개가 깔리기"],
    ["평생 한 가지 저주가 매일 다른 내용으로 바뀌기", "평생 한 가지 축복이 아무도 축복이라 믿지 않기"],
  ]},
};

const traitFor = (aPct: number) => aPct >= 70
  ? ["결단력 있는 직진형", "고민보다 선택이 빠릅니다. 일단 저지르고 나중에 합리화하는 타입." ]
  : aPct <= 30
    ? ["끝까지 비교하는 신중형", "최악의 상황에서도 더 나은 지옥을 찾아내는 분석가입니다."]
    : ["양쪽 다 의심하는 균형형", "어느 한쪽에도 쉽게 휘둘리지 않는 양손잡이 멘탈입니다."];

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [isSplashExiting, setIsSplashExiting] = useState(false);
  const [view, setView] = useState<"lobby" | "game" | "result">("lobby");
  const [mode, setMode] = useState<ModeKey>("mild");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [counts, setCounts] = useState({ a: 0, b: 0 });
  const [theme, setTheme] = useState<"dark" | "light">(() => (localStorage.getItem("balance-theme") as "dark" | "light") || "dark");
  const [muted, setMuted] = useState(() => localStorage.getItem("balance-bgm-muted") === "true");
  const [soundscape, setSoundscape] = useState<"neon" | "dead-air">(() => localStorage.getItem("balance-soundscape") === "dead-air" ? "dead-air" : "neon");
  const [copied, setCopied] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [updateRegistration, setUpdateRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateDismissed, setUpdateDismissed] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => typeof Notification === "undefined" ? "default" : Notification.permission);
  const [isInstalled, setIsInstalled] = useState(() => window.matchMedia?.("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);
  const [showSettings, setShowSettings] = useState(false);
  const [isClosingMenu, setIsClosingMenu] = useState(false);
  const [showAppInfo, setShowAppInfo] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateComplete, setUpdateComplete] = useState(() => sessionStorage.getItem("pwa-update-complete") === "true");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const exitTimer = window.setTimeout(() => setIsSplashExiting(true), 2200);
    const removeTimer = window.setTimeout(() => setShowSplash(false), 2960);
    return () => { window.clearTimeout(exitTimer); window.clearTimeout(removeTimer); };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("balance-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("balance-soundscape", soundscape);
  }, [soundscape]);

  useEffect(() => {
    if (!updateComplete) return;
    sessionStorage.removeItem("pwa-update-complete");
    const timer = window.setTimeout(() => setUpdateComplete(false), 3600);
    return () => window.clearTimeout(timer);
  }, [updateComplete]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };
    const handleAppInstalled = () => setDeferredPrompt(null);
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    const standaloneQuery = window.matchMedia?.("(display-mode: standalone)");
    const handleDisplayModeChange = () => setIsInstalled(standaloneQuery?.matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);
    standaloneQuery?.addEventListener?.("change", handleDisplayModeChange);
    window.addEventListener("appinstalled", handleDisplayModeChange);
    return () => {
      standaloneQuery?.removeEventListener?.("change", handleDisplayModeChange);
      window.removeEventListener("appinstalled", handleDisplayModeChange);
    };
  }, []);

  useEffect(() => {
    const handleUpdateAvailable = (event: Event) => {
      const registration = (event as CustomEvent<ServiceWorkerRegistration>).detail;
      if (registration) {
        setUpdateRegistration(registration);
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          registration.showNotification("Zero-Sum 새 버전 도착", {
            body: "앱 설정에서 업데이트를 적용할 수 있습니다.",
            icon: ASSETS.logo,
            badge: ASSETS.logo,
            tag: "zero-sum-update",
          }).catch(() => undefined);
        }
      }
    };
    window.addEventListener("pwa-update-available", handleUpdateAvailable);
    return () => window.removeEventListener("pwa-update-available", handleUpdateAvailable);
  }, []);

  useEffect(() => {
    if (!showSettings) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeQuickMenu();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showSettings]);

  const bgmSrcFor = (m: ModeKey) => (m === "hell" ? ASSETS.bgmHell : ASSETS.bgmLobby);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(bgmSrcFor(mode));
      audioRef.current.loop = true;
      audioRef.current.volume = 0.2;
    }
    audioRef.current.muted = muted;
    localStorage.setItem("balance-bgm-muted", String(muted));
  }, [muted]);

  const current = questions[questionIndex];
  const total = questions.length || 10;
  const progress = view === "game" ? ((questionIndex + 1) / total) * 100 : 0;
  const aPct = counts.a + counts.b ? Math.round((counts.a / (counts.a + counts.b)) * 100) : 0;
  const bPct = 100 - aPct;
  const trait = traitFor(aPct);
  const finishMessage = useMemo(() => ({
    mild: ["일상 고통의 생활인", "사소한 지옥도 정면으로 마주한 진정한 생활형 인간입니다."],
    spicy: ["사회적 수치심 생존자", "이 정도면 단톡방이 유출돼도 일단 읽씹할 수 있습니다."],
    mala: ["기괴함과 한 몸", "당신의 머릿속은 이미 평범함과 결별했습니다."],
    hell: ["지옥 명예 졸업생", "이 모든 걸 버틴 당신에게 웬만한 악몽도 귀엽습니다."],
  }[mode]), [mode]);

  const start = (nextMode: ModeKey) => {
    const nextQuestions = [...MODES[nextMode].questions].sort(() => Math.random() - 0.5);
    setMode(nextMode); setQuestions(nextQuestions); setQuestionIndex(0); setCounts({ a: 0, b: 0 }); setView("game");
    const nextSrc = bgmSrcFor(nextMode);
    if (audioRef.current) {
      const currentSrc = audioRef.current.getAttribute("src");
      if (currentSrc !== nextSrc) {
        const wasPlaying = !audioRef.current.paused;
        audioRef.current.src = nextSrc;
        if (wasPlaying || !muted) audioRef.current.play().catch(() => undefined);
      } else if (!muted) {
        audioRef.current.play().catch(() => undefined);
      }
    }
  };

  const choose = (choice: "a" | "b") => {
    if (navigator.vibrate) navigator.vibrate(choice === "a" ? [28] : [18, 18, 28]);
    const nextCounts = { ...counts, [choice]: counts[choice] + 1 };
    if (questionIndex >= total - 1) { setCounts(nextCounts); setView("result"); return; }
    setCounts(nextCounts); setQuestionIndex((index) => index + 1);
  };

  const reset = () => {
    setView("lobby"); setQuestions([]); setCounts({ a: 0, b: 0 });
    if (audioRef.current) {
      const lobbySrc = bgmSrcFor("mild");
      if (audioRef.current.getAttribute("src") !== lobbySrc) {
        const wasPlaying = !audioRef.current.paused;
        audioRef.current.src = lobbySrc;
        if (wasPlaying) audioRef.current.play().catch(() => undefined);
      }
    }
  };
  const openQuickMenu = () => { setIsClosingMenu(false); setShowAppInfo(false); setShowSettings(true); };
  const closeQuickMenu = () => {
    if (!showSettings || isClosingMenu) return;
    setIsClosingMenu(true);
    window.setTimeout(() => { setShowSettings(false); setIsClosingMenu(false); }, 180);
  };
  const toggleAudio = () => setMuted((value) => !value);
  const toggleSoundscape = () => setSoundscape((value) => value === "dead-air" ? "neon" : "dead-air");
  const sendTestNotification = async () => {
    if (!("Notification" in window)) return;
    const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
    setNotificationPermission(permission);
    if (permission !== "granted") return;
    const registration = await navigator.serviceWorker?.ready;
    if (registration) {
      await registration.showNotification("Zero-Sum 알림 테스트", {
        body: "알림이 정상적으로 연결되었습니다. 이제 새 버전 소식을 받을 수 있습니다.",
        icon: ASSETS.logo,
        badge: ASSETS.logo,
        tag: "zero-sum-test",
      });
    } else {
      new Notification("Zero-Sum 알림 테스트", { body: "알림이 정상적으로 연결되었습니다." });
    }
  };
  const requestNotifications = async () => {
    await sendTestNotification();
  };
  const installApp = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };
  const checkForUpdate = async () => {
    setIsCheckingUpdate(true);
    try {
      const registration = await navigator.serviceWorker?.getRegistration();
      if (registration) {
        await registration.update();
        if (registration.waiting) setUpdateRegistration(registration);
        else window.setTimeout(() => setIsCheckingUpdate(false), 700);
      } else {
        window.setTimeout(() => setIsCheckingUpdate(false), 700);
      }
    } catch {
      setIsCheckingUpdate(false);
    }
  };
  const updateApp = () => {
    const waitingWorker = updateRegistration?.waiting;
    if (!waitingWorker || isUpdating) return;
    sessionStorage.setItem("pwa-update-complete", "true");
    setIsUpdating(true);
    navigator.serviceWorker.addEventListener("controllerchange", () => window.location.reload(), { once: true });
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
  };
  const share = async () => {
    const siteUrl = window.location.href;
    const text = `${MODES[mode].label} 결과\nA ${aPct}% / B ${bPct}% · ${trait[0]}\n\n내 결과 확인하기: ${siteUrl}`;
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1400); } catch { setCopied(false); }
  };

  return (
    <main className={`app-shell ${showSplash ? "is-splashing" : ""} ${soundscape === "dead-air" ? "is-dead-air" : ""}`}>
      <div className="ambient-art" />
      <section className="phone-frame">
        <header className="topbar">
          <button className="brand-lockup" onClick={reset} aria-label="로비로 돌아가기">
            <img src={ASSETS.logo} alt="" className="brand-mark" />
            <span><b>밸런스 게임</b><small>미치고 환장하는 선택의 시간</small></span>
          </button>
          <div className="top-actions header-menu-only">
            <button className={`icon-button settings-trigger ${showSettings ? "is-open" : ""}`} onClick={openQuickMenu} aria-label="앱 메뉴 열기" title="앱 메뉴"><Settings size={18} /></button>
          </div>
        </header>

        {view === "lobby" && <section className="view lobby-view">
          <div className="title-stack"><div className="title-bolt">⚡</div><p className="lobby-kicker">NO RIGHT ANSWER</p><h1 className="lobby-title" data-text="Zero-Sum"><em>Zero-Sum</em></h1></div>
          <p className="responsibility-note lobby-warning">이 게임은 당신의 인간관계를 책임지지 않습니다.</p>
          <div className="mode-grid">
            {(Object.keys(MODES) as ModeKey[]).map((key) => <button key={key} className={`mode-card mode-${key}`} onClick={() => start(key)}>
              <span className="mode-glow" /><b>{MODES[key].label}</b>
            </button>)}
          </div>
        </section>}

        {view === "game" && current && <section className="view game-view">
          <div className="game-meta"><span className={`mode-chip ${MODES[mode].color}`}>{MODES[mode].label}</span><span><b>{questionIndex + 1}</b> / {total}</span></div>
          <div className="progress-track"><i style={{ width: `${progress}%` }} /></div>
          <div className="question-head"><span>오늘의 난제</span><h2>다음 중 하나를<br />평생 겪어야 한다면?</h2></div>
          <div className="choice-stack">
            <button className="choice-card choice-a" onClick={() => choose("a")}><span className="choice-top"><b>A</b><small>01</small></span><strong>{current[0]}</strong></button>
            <div className="vs-core">VS</div>
            <button className="choice-card choice-b" onClick={() => choose("b")}><span className="choice-top"><b>B</b><small>02</small></span><strong>{current[1]}</strong></button>
          </div>
          <p className="hint">카드를 누르면 다음 문제로 넘어갑니다.</p>
        </section>}

        {view === "result" && <section className="view result-view">
          <div className="result-icon">⚡</div>
          <span className="eyebrow">RUN COMPLETE · {MODES[mode].label}</span>
          <h2>{finishMessage[0]}</h2><p>{finishMessage[1]}</p>
          <div className="result-summary">{MODES[mode].label} · {total}문제 완주</div>
          <div className="stats-panel"><div className="stats-heading"><span>선택 결과 통계</span><b>A + B = 100%</b></div>
            <div className="stat-row"><b className="a-label">A</b><div className="stat-track"><i className="a-fill" style={{ width: `${aPct}%` }} /></div><strong>{aPct}%</strong></div>
            <div className="stat-row"><b className="b-label">B</b><div className="stat-track"><i className="b-fill" style={{ width: `${bPct}%` }} /></div><strong>{bPct}%</strong></div>
          </div>
          <div className="trait-card"><span>YOUR TYPE</span><b>{trait[0]}</b><p>{trait[1]}</p></div>
          <div className="result-actions"><button className="primary-action" onClick={share}><Share2 size={16} /> {copied ? "결과 복사 완료" : "결과 공유하기"}</button><button className="secondary-action" onClick={() => start(mode)}><RotateCcw size={15} /> 같은 모드 다시 하기</button><button className="secondary-action" onClick={reset}>처음으로 돌아가기</button></div>
        </section>}
        {updateComplete && <div className="update-toast update-complete-toast" role="status"><span><b>업데이트 완료</b><small>최신 버전의 Zero-Sum이 적용되었습니다.</small></span><Check className="update-complete-icon" size={18} /></div>}
        {updateRegistration && !updateDismissed && <div className="update-toast" role="status"><span><b>새 버전 도착</b><small>{isUpdating ? "최신 버전을 적용하는 중입니다..." : "더 안정적인 Zero-Sum을 사용할 수 있습니다."}</small></span><div className="update-actions">{isUpdating ? <button className="update-apply" disabled><Loader2 className="spin" size={13} /> 적용 중</button> : <button className="update-apply" onClick={updateApp}>업데이트하기</button>}<button className="update-dismiss" onClick={() => setUpdateDismissed(true)} aria-label="업데이트 알림 닫기"><X size={13} /></button></div></div>}
        {deferredPrompt && !isInstalled && <div className="install-cta"><button className="install-button" onClick={installApp}><Download size={15} /> 앱 설치하기</button></div>}
        {showSettings && <div className={`quick-menu-backdrop ${isClosingMenu ? "is-closing" : ""}`} role="presentation" onClick={closeQuickMenu}><section className="quick-menu" role="dialog" aria-modal="true" aria-label="빠른 설정" onClick={(event) => event.stopPropagation()}><div className="quick-menu-head"><span><small>QUICK MENU</small><b>Zero-Sum</b></span><button className="settings-close" onClick={closeQuickMenu} aria-label="메뉴 닫기"><X size={16} /></button></div><div className="quick-actions"><button className={`quick-action theme-action theme-${theme}`} onClick={() => setTheme(theme === "dark" ? "light" : "dark")}><span className="theme-icon" aria-hidden="true">{theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}</span><span>{theme === "dark" ? "화이트 모드" : "다크 모드"}</span><small className="theme-state">{theme === "dark" ? "현재 다크" : "현재 라이트"}</small></button><button className="quick-action" onClick={toggleAudio}>{muted ? <VolumeX size={16} /> : <Volume2 size={16} />}<span>{muted ? "배경음 켜기" : "배경음 끄기"}</span></button><button className={`quick-action soundscape-action ${soundscape === "dead-air" ? "is-active" : ""}`} onClick={toggleSoundscape}><Zap size={16} /><span>{soundscape === "dead-air" ? "Dead Air 효과" : "Neon Pulse"}</span><small>{soundscape === "dead-air" ? "광기 ON" : "기본 로비"}</small></button><button className={`quick-action ${isCheckingUpdate ? "is-checking" : ""}`} onClick={checkForUpdate}><RefreshCw size={16} /><span>업데이트 확인</span></button></div><button className="quick-info-toggle" onClick={() => setShowAppInfo((value) => !value)}><span>앱 정보 · 알림 설정</span><small>{showAppInfo ? "닫기" : "보기"}</small></button>{showAppInfo && <div className="quick-info"><div><span>앱 버전</span><strong>v{APP_VERSION}</strong></div><div><span>설치 상태</span><strong>{isInstalled ? "설치됨" : "브라우저 모드"}</strong></div><div><span>알림 권한</span><strong>{notificationPermission === "granted" ? "허용됨" : notificationPermission === "denied" ? "차단됨" : "미설정"}</strong></div><button className="quick-test" onClick={sendTestNotification}><Bell size={14} /> 테스트 알림 보내기</button></div>}</section></div>}
        <footer><span>© 2026 BALANCE GAME</span><span>{view === "game" ? "CHOICE ENGINE: ONLINE" : "NO WAY BACK"}</span></footer>
      </section>
      {showSplash && <div className={`splash-screen ${isSplashExiting ? "is-exiting" : ""}`} role="status" aria-label="Zero-Sum 시작 화면"><div className="splash-grid" /><div className="splash-scanline" /><div className="splash-fracture" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /></div><div className="splash-flash" aria-hidden="true" /><div className="splash-core"><div className="splash-bolt-wrap"><span className="splash-bolt-backdrop" /><img src={ASSETS.logo} alt="" className="splash-logo" /></div><p className="splash-kicker">NO RIGHT ANSWER</p><h1 className="splash-title" data-text="Zero-Sum">Zero-Sum</h1><div className="splash-loading"><span /><i>CHOICE ENGINE: ONLINE</i></div></div><span className="splash-corner splash-corner-tl" /><span className="splash-corner splash-corner-br" /></div>}
    </main>
  );
}
