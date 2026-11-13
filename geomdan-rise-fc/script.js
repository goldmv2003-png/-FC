
// ========================================
// GEOMDAN RISE FC - MAIN SCRIPT
// ========================================

// SUPABASE 연결
const SUPABASE_URL = "https://gqsecxgzegyzzwlmfavr.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_8BKTlYkIEEwNS-dDauIfFg_3FSdkcDJ";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);


// ========================================
// PLAYER MANAGEMENT
// ========================================

let players = [];

const playerGrid = document.getElementById("player-grid");
const filterButtons = document.querySelectorAll(".filter-btn");
const modal = document.getElementById("player-modal");

let currentPosition = "ALL";

function escapePlayerHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

// 선수 목록 불러오기
async function loadPlayers() {
  if (!playerGrid) return;

  playerGrid.innerHTML = "선수단 정보를 불러오는 중입니다.";

  const { data, error } = await supabaseClient
    .from("players")
    .select("*")
    .order("number", { ascending: true });

  if (error) {
    console.error("선수 조회 오류:", error);
    playerGrid.innerHTML = "선수 정보를 불러오지 못했습니다.";
    return;
  }

  players = data || [];
  renderPlayers(currentPosition);

  console.log("선수 데이터 로딩 완료", players);
}

// 선수 카드 출력
function renderPlayers(position = "ALL") {
  if (!playerGrid) return;

  currentPosition = position;

  const filteredPlayers = position === "ALL"
    ? players
    : players.filter(player => player.position === position);

  if (filteredPlayers.length === 0) {
    playerGrid.innerHTML = `
      <p style="color:#999;text-align:center;padding:40px;">
        등록된 선수가 없습니다.
      </p>`;
    return;
  }

  playerGrid.innerHTML = filteredPlayers.map(player => `
    <div class="player-card" data-player-id="${escapePlayerHTML(player.id)}">
      <div class="player-photo">
        ${
          player.photo_url
          ? `<img src="${escapePlayerHTML(player.photo_url)}"
               alt="${escapePlayerHTML(player.name)}"
               style="width:100%;height:100%;object-fit:cover;"
               onerror="this.style.display='none'">`
          : `<strong>RISE</strong>
             <span>${String(player.number).padStart(2, "0")}</span>`
        }
      </div>
      <div class="player-info">
        <small>${escapePlayerHTML(player.position)}</small>
        <h3>
  <span style="color:#c9a646; margin-right:8px;">
    #${String(player.number).padStart(2, "0")}
  </span>

  ${escapePlayerHTML(player.name)}

  ${
    player.is_captain
    ? `<span style="
        display:inline-block;
        margin-left:8px;
        padding:3px 7px;
        background:#c9a646;
        color:#080808;
        font-size:11px;
        font-weight:900;
        border-radius:4px;
        vertical-align:middle;
      ">C</span>`
    : ""
  }
</h3>
        <p>GEOMDAN RISE FC</p>
      </div>
    </div>
  `).join("");
}

// 포지션 필터
filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    filterButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    renderPlayers(button.dataset.position);
  });
});

// 선수 상세 팝업
if (playerGrid) {
  playerGrid.addEventListener("click", event => {
    const card = event.target.closest(".player-card");
    if (!card) return;

    const player = players.find(
      p => String(p.id) === card.dataset.playerId
    );

    if (!player || !modal) return;

    document.getElementById("modal-number").textContent =
      String(player.number).padStart(2, "0");

    document.getElementById("modal-name").textContent = player.name;
    document.getElementById("modal-position").textContent = player.position;
    document.getElementById("modal-description").textContent =
      player.description || "선수 소개가 준비 중입니다.";

    modal.classList.add("show");
  });
}

// 팝업 닫기
const modalClose = document.getElementById("modal-close");

if (modalClose && modal) {
  modalClose.addEventListener("click", () => {
    modal.classList.remove("show");
  });

  modal.addEventListener("click", event => {
    if (event.target === modal) modal.classList.remove("show");
  });
}

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && modal) {
    modal.classList.remove("show");
  }
});

// 선수 데이터 최초 로딩
loadPlayers();


// ========================================
// RISE FC INTRO VIDEO
// ========================================

const introScreen = document.getElementById("intro-screen");
const introVideo = document.getElementById("intro-video");
const mainWebsite = document.getElementById("main-website");
const skipButton = document.getElementById("skip-intro");

function finishIntro() {
  if (!introScreen || introScreen.classList.contains("hide")) return;

  introScreen.classList.add("hide");

  if (mainWebsite) mainWebsite.classList.add("show");

  setTimeout(() => {
    introScreen.style.display = "none";
  }, 800);

  if (introVideo) introVideo.pause();
}

async function startIntro() {
  if (!introVideo) {
    finishIntro();
    return;
  }

  try {
    introVideo.muted = false;
    introVideo.volume = 1;
    await introVideo.play();
  } catch (error) {
    console.log("무음 재생 시도");

    introVideo.muted = true;

    try {
      await introVideo.play();
    } catch (error) {
      console.log("영상 재생 실패:", error);
      finishIntro();
    }
  }
}

if (skipButton) {
  skipButton.addEventListener("click", finishIntro);
}

if (introVideo) {
  introVideo.addEventListener("ended", finishIntro);
  introVideo.addEventListener("error", finishIntro);
}

window.addEventListener("load", startIntro);


// ========================================
// RISE FC LOGIN & SIGNUP
// ========================================

const authModal = document.getElementById("auth-modal");
const loginOpen = document.getElementById("login-open");
const signupOpen = document.getElementById("signup-open");
const authClose = document.getElementById("auth-close");

const loginTab = document.getElementById("login-tab");
const signupTab = document.getElementById("signup-tab");

const authForm = document.getElementById("auth-form");
const authTitle = document.getElementById("auth-title");
const authSubmit = document.getElementById("auth-submit");

const authName = document.getElementById("auth-name");
const authEmail = document.getElementById("auth-email");
const authPassword = document.getElementById("auth-password");
const authMessage = document.getElementById("auth-message");

let authMode = "login";

function setAuthMode(mode) {
  authMode = mode;

  if (!authMessage || !authTitle || !authSubmit) return;

  authMessage.textContent = "";

  if (mode === "login") {
    authTitle.textContent = "RISE FC LOGIN";
    authSubmit.textContent = "로그인";

    loginTab?.classList.add("active");
    signupTab?.classList.remove("active");

    authName?.classList.add("hidden");
    if (authName) authName.required = false;
  } else {
    authTitle.textContent = "JOIN RISE FC";
    authSubmit.textContent = "회원가입";

    signupTab?.classList.add("active");
    loginTab?.classList.remove("active");

    authName?.classList.remove("hidden");
    if (authName) authName.required = true;
  }
}

loginOpen?.addEventListener("click", () => {
  setAuthMode("login");
  authModal?.classList.add("show");
});

signupOpen?.addEventListener("click", () => {
  setAuthMode("signup");
  authModal?.classList.add("show");
});

loginTab?.addEventListener("click", () => setAuthMode("login"));
signupTab?.addEventListener("click", () => setAuthMode("signup"));

authClose?.addEventListener("click", () => {
  authModal?.classList.remove("show");
});

authModal?.addEventListener("click", event => {
  if (event.target === authModal) authModal.classList.remove("show");
});

// 로그인 및 회원가입
authForm?.addEventListener("submit", async event => {
  event.preventDefault();

  const email = authEmail.value.trim();
  const password = authPassword.value;
  const name = authName?.value.trim() || "";

  authSubmit.disabled = true;
  authMessage.textContent = "처리 중입니다.";

  try {
    if (authMode === "signup") {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name }
        }
      });

      if (error) throw error;

      authMessage.textContent = data.session
        ? "회원가입이 완료되었습니다!"
        : "회원가입 완료! 이메일 인증을 확인해 주세요.";
    } else {
      const { data, error } =
        await supabaseClient.auth.signInWithPassword({
          email,
          password
        });

      if (error) throw error;

      authMessage.textContent = "로그인 성공! 환영합니다.";

      console.log("로그인 사용자:", data.user);

      setTimeout(() => {
        authModal?.classList.remove("show");
        authForm.reset();
        setAuthMode("login");
      }, 1200);
    }
  } catch (error) {
    console.error("인증 오류:", error);
    authMessage.textContent = error.message;
  } finally {
    authSubmit.disabled = false;
  }
});

setAuthMode("login");


// ========================================
// MEMBER LOGIN STATUS
// ========================================

const headerAuthUser = document.createElement("span");
headerAuthUser.className = "auth-user-name";

const headerLogoutBtn = document.createElement("button");
headerLogoutBtn.className = "logout-btn";
headerLogoutBtn.textContent = "로그아웃";

const headerActions = document.querySelector(".header-actions");

const loginButton = document.getElementById("login-open");
const signupButton = document.getElementById("signup-open");

const joinButton = headerActions?.querySelector(".join-btn");

if (headerActions && joinButton) {
  headerActions.insertBefore(headerAuthUser, joinButton);
  headerActions.insertBefore(headerLogoutBtn, joinButton);
}

function updateHeaderAuth(user) {
  if (!headerActions) return;

  if (user) {
    const memberName =
      user.user_metadata?.full_name || user.email.split("@")[0];

    headerAuthUser.textContent = memberName + "님 환영합니다";

    headerAuthUser.style.display = "inline-block";
    headerLogoutBtn.style.display = "inline-block";

    if (loginButton) loginButton.style.display = "none";
    if (signupButton) signupButton.style.display = "none";
  } else {
    headerAuthUser.style.display = "none";
    headerLogoutBtn.style.display = "none";

    if (loginButton) loginButton.style.display = "inline-block";
    if (signupButton) signupButton.style.display = "inline-block";
  }
}

// 로그아웃
headerLogoutBtn.addEventListener("click", async () => {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    alert("로그아웃에 실패했습니다: " + error.message);
    return;
  }

  authModal?.classList.remove("show");
  alert("로그아웃되었습니다.");
});

// 로그인 상태 확인
async function checkLoginStatus() {
  const { data, error } = await supabaseClient.auth.getSession();

  if (error) {
    console.error("로그인 상태 확인 오류:", error);
    return;
  }

  updateHeaderAuth(data.session?.user || null);
}

supabaseClient.auth.onAuthStateChange((event, session) => {
  updateHeaderAuth(session?.user || null);
});

checkLoginStatus();

console.log("GEOMDAN RISE FC 전체 기능 연결 완료!");

// ========================================
// MAIN PAGE - UPCOMING MATCHES
// ========================================

const mainMatchList = document.getElementById("match-list");
const mainMatchBox = document.querySelector(".match-box");

async function loadMainMatches() {

  if (!mainMatchList) return;

  mainMatchList.innerHTML = `
    <p style="text-align:center;padding:30px;color:#aaa;">
      경기 일정을 불러오는 중입니다.
    </p>
  `;

  try {

    const { data, error } = await supabaseClient
      .from("matches")
      .select("*")
      .eq("is_published", true)
      .order("match_date", { ascending: true });

    if (error) throw error;

    const today = new Date().toLocaleDateString("en-CA");

    // 다가오는 경기만 추출
    const upcomingMatches = (data || [])
      .filter(match => {

        const matchDate = String(match.match_date || "").slice(0, 10);

        return (
          matchDate >= today &&
          match.status !== "finished"
        );

      })
      .sort((a, b) =>
        String(a.match_date).localeCompare(String(b.match_date))
      )
      .slice(0, 3);

    // 경기가 없을 때
    if (upcomingMatches.length === 0) {

      mainMatchList.innerHTML = `
        <div class="match-empty">
          등록된 경기 일정이 없습니다.
        </div>
      `;

      if (mainMatchBox) {
        mainMatchBox.style.display = "none";
      }

      return;
    }

    // 대표 경기 표시
    const nextMatch = upcomingMatches[0];

    if (mainMatchBox) {

      mainMatchBox.style.display = "flex";

      const teamBoxes = mainMatchBox.querySelectorAll("div");

      if (teamBoxes.length >= 2) {

        teamBoxes[0].innerHTML = `
          <strong>RISE FC</strong>
          <span>검단 라이즈FC</span>
        `;

        teamBoxes[1].innerHTML = `
          <strong>${escapePlayerHTML(nextMatch.opponent)}</strong>
          <span>상대 구단</span>
        `;

      }

    }

    // 경기 목록 출력
    mainMatchList.innerHTML = upcomingMatches.map(match => `

      <article style="
        background:#151515;
        border:1px solid #333;
        border-radius:10px;
        padding:22px;
        margin-bottom:15px;
      ">

        <span style="
          display:inline-block;
          background:#333;
          color:#c9a646;
          padding:6px 10px;
          font-size:11px;
          border-radius:4px;
          margin-bottom:12px;
        ">
          UPCOMING MATCH
        </span>

        <h3 style="
          color:white;
          font-size:20px;
          margin-bottom:14px;
        ">
          GEOMDAN RISE FC vs ${escapePlayerHTML(match.opponent)}
        </h3>

        <p style="
          color:#bbb;
          font-size:14px;
          line-height:2;
        ">
          📅 ${escapePlayerHTML(match.match_date)}
          ${escapePlayerHTML(match.match_time || "")}
          <br>
          📍 ${escapePlayerHTML(match.venue || "장소 미정")}
        </p>

      </article>

    `).join("");

    console.log("메인 경기 일정 로딩 완료:", upcomingMatches);

  } catch (error) {

    console.error("메인 경기 일정 오류:", error);

    mainMatchList.innerHTML = `
      <p style="color:#ff7777;text-align:center;padding:30px;">
        경기 정보를 불러오지 못했습니다.
      </p>
    `;

  }

}

// 최초 경기 데이터 로딩
loadMainMatches();

// 경기 데이터 실시간 업데이트
supabaseClient
  .channel("main-page-match-updates")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "matches"
    },
    () => {
      loadMainMatches();
    }
  )
  .subscribe();

// ========================================
// RISE FC NOTICE & PHOTO GALLERY
// ========================================

const noticeList = document.getElementById("notice-list");
const noticeAdminTools = document.getElementById("notice-admin-tools");

const galleryGrid = document.getElementById("gallery-grid");
const galleryAdminTools = document.getElementById("gallery-admin-tools");

let riseFcIsAdmin = false;


// HTML 보안 처리
function riseEscape(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}


// ========================================
// 관리자 권한 확인
// ========================================

async function checkRiseFcAdmin() {

  riseFcIsAdmin = false;

  const { data: { user }, error } =
    await supabaseClient.auth.getUser();

  if (error || !user) {
    updateRiseFcAdminUI();
    return;
  }

  const { data: admin, error: adminError } =
    await supabaseClient
      .from("rise_fc_admins")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

  if (adminError) {
    console.error("관리자 권한 확인 실패:", adminError);
    updateRiseFcAdminUI();
    return;
  }

  riseFcIsAdmin = !!admin;

  updateRiseFcAdminUI();
}


// ========================================
// 관리자 버튼 표시
// ========================================

function updateRiseFcAdminUI() {

  if (noticeAdminTools) {
    noticeAdminTools.innerHTML = "";
  }

  if (galleryAdminTools) {
    galleryAdminTools.innerHTML = "";
  }

  if (!riseFcIsAdmin) return;

  // 공지사항 글쓰기 버튼
  if (noticeAdminTools) {

    noticeAdminTools.innerHTML = `
      <button
        type="button"
        class="notice-write-btn"
        id="notice-write-toggle"
      >
        + 공지사항 글쓰기
      </button>

      <form class="notice-write-form" id="notice-write-form">

        <input
          type="text"
          id="notice-title"
          placeholder="공지사항 제목을 입력하세요."
          maxlength="150"
          required
        >

        <textarea
          id="notice-content"
          placeholder="공지사항 내용을 입력하세요."
          required
        ></textarea>

        <div class="notice-form-actions">

          <button type="submit" class="notice-submit">
            공지사항 등록
          </button>

          <button
            type="button"
            class="notice-cancel"
            id="notice-write-cancel"
          >
            취소
          </button>

        </div>

      </form>
    `;

    document.getElementById("notice-write-toggle")
      .addEventListener("click", () => {
        document.getElementById("notice-write-form")
          .classList.toggle("show");
      });

    document.getElementById("notice-write-cancel")
      .addEventListener("click", () => {
        document.getElementById("notice-write-form").reset();
        document.getElementById("notice-write-form")
          .classList.remove("show");
      });

    document.getElementById("notice-write-form")
      .addEventListener("submit", createRiseNotice);
  }

  // 사진 추가 버튼
  if (galleryAdminTools) {

    galleryAdminTools.innerHTML = `
      <button
        type="button"
        class="gallery-plus-btn"
        id="gallery-upload-btn"
        title="사진 추가"
      >+</button>

      <input
        type="file"
        id="gallery-file-input"
        accept="image/*"
        multiple
        hidden
      >
    `;

    const uploadButton =
      document.getElementById("gallery-upload-btn");

    const fileInput =
      document.getElementById("gallery-file-input");

    uploadButton.addEventListener("click", () => {
      fileInput.click();
    });

    fileInput.addEventListener("change", async () => {

      if (fileInput.files.length > 0) {
        await uploadRiseGalleryPhotos(fileInput.files);
      }

      fileInput.value = "";
    });
  }
}


// ========================================
// 공지사항 불러오기
// ========================================

async function loadRiseNotices() {

  if (!noticeList) return;

  noticeList.innerHTML = `
    <div class="notice-loading">
      공지사항을 불러오는 중입니다.
    </div>
  `;

  const { data, error } = await supabaseClient
    .from("rise_fc_notices")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {

    console.error("공지사항 조회 오류:", error);

    noticeList.innerHTML = `
      <div class="notice-empty">
        공지사항을 불러오지 못했습니다.
      </div>
    `;

    return;
  }

  if (!data || data.length === 0) {

    noticeList.innerHTML = `
      <div class="notice-empty">
        등록된 공지사항이 없습니다.
      </div>
    `;

    return;
  }

  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;

  noticeList.innerHTML = `
    <div class="notice-list">

      ${data.map(notice => {

        const createdAt = new Date(notice.created_at);
        const isNew =
          now - createdAt.getTime() < sevenDays &&
          now >= createdAt.getTime();

        const date = createdAt.toLocaleDateString("ko-KR");

        return `
          <article
            class="notice-item"
            data-notice-id="${notice.id}"
          >

            <div class="notice-item-main">

              <div class="notice-item-title">

                ${isNew ? `
                  <span class="notice-new">N</span>
                ` : ""}

                <span>${riseEscape(notice.title)}</span>

              </div>

              <div class="notice-date">
                ${date}
              </div>

              <div class="notice-content">
                ${riseEscape(notice.content)}
              </div>

            </div>

            ${riseFcIsAdmin ? `
              <div class="notice-item-actions">
                <button
                  type="button"
                  class="notice-delete-btn"
                  data-delete-notice="${notice.id}"
                >
                  삭제
                </button>
              </div>
            ` : ""}

          </article>
        `;

      }).join("")}

    </div>
  `;
}


// ========================================
// 공지사항 등록
// ========================================

async function createRiseNotice(event) {

  event.preventDefault();

  if (!riseFcIsAdmin) {
    alert("관리자만 공지사항을 등록할 수 있습니다.");
    return;
  }

  const title =
    document.getElementById("notice-title").value.trim();

  const content =
    document.getElementById("notice-content").value.trim();

  if (!title || !content) {
    alert("제목과 내용을 모두 입력해 주세요.");
    return;
  }

  const submitButton =
    document.querySelector(".notice-submit");

  submitButton.disabled = true;
  submitButton.textContent = "등록 중...";

  try {

    const { data: { user } } =
      await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error("로그인이 필요합니다.");
    }

    const { error } = await supabaseClient
      .from("rise_fc_notices")
      .insert([{
        title,
        content,
        created_by: user.id
      }]);

    if (error) throw error;

    alert("공지사항이 등록되었습니다!");

    document.getElementById("notice-write-form").reset();

    document.getElementById("notice-write-form")
      .classList.remove("show");

    await loadRiseNotices();

  } catch (error) {

    console.error("공지사항 등록 오류:", error);
    alert("공지사항 등록 실패: " + error.message);

  } finally {

    submitButton.disabled = false;
    submitButton.textContent = "공지사항 등록";

  }
}


// ========================================
// 공지사항 삭제
// ========================================

if (noticeList) {

  noticeList.addEventListener("click", async event => {

    const deleteButton =
      event.target.closest("[data-delete-notice]");

    if (deleteButton) {

      if (!riseFcIsAdmin) {
        alert("관리자만 삭제할 수 있습니다.");
        return;
      }

      const id = deleteButton.dataset.deleteNotice;

      if (!confirm("이 공지사항을 삭제하시겠습니까?")) {
        return;
      }

      const { error } = await supabaseClient
        .from("rise_fc_notices")
        .delete()
        .eq("id", id);

      if (error) {
        alert("삭제 실패: " + error.message);
        return;
      }

      alert("공지사항이 삭제되었습니다.");

      await loadRiseNotices();

      return;
    }

    const item = event.target.closest(".notice-item");

    if (item) {
      item.classList.toggle("open");
    }

  });

}


// ========================================
// 사진 갤러리 불러오기
// ========================================

async function loadRiseGallery() {

  if (!galleryGrid) return;

  galleryGrid.innerHTML = `
    <div class="notice-loading">
      사진을 불러오는 중입니다.
    </div>
  `;

  const { data, error } = await supabaseClient
    .from("rise_fc_gallery")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("갤러리 조회 오류:", error);

    galleryGrid.innerHTML = `
      <div class="notice-empty">
        사진을 불러오지 못했습니다.
      </div>
    `;
    return;
  }

  if (!data || data.length === 0) {
    galleryGrid.innerHTML = `
      <div class="notice-empty">
        등록된 사진이 없습니다.
      </div>
    `;
    return;
  }

  galleryGrid.innerHTML = data.map(photo => {

    const createdAt = new Date(photo.created_at);

    const photoDate = isNaN(createdAt.getTime())
      ? ""
      : createdAt.toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit"
        }).replace(/\. /g, ".").replace(/\.$/, "");

    return `
      <article class="gallery-item">

        <div class="gallery-image-wrap">

          ${riseFcIsAdmin ? `
            <button
              type="button"
              class="gallery-delete-btn"
              data-delete-photo="${riseEscape(photo.id)}"
            >
              삭제
            </button>
          ` : ""}

          <img
            src="${riseEscape(photo.image_url)}"
            alt="${riseEscape(photo.caption || "라이즈FC 사진")}"
            loading="lazy"
            data-gallery-image="${riseEscape(photo.image_url)}"
          >

        </div>

        <div class="gallery-info">

          ${photo.caption ? `
            <div class="gallery-caption">
              ${riseEscape(photo.caption)}
            </div>
          ` : ""}

          <div class="gallery-date">
            ${photoDate}
          </div>

        </div>

      </article>
    `;

  }).join("");

}


// ========================================
// 사진 업로드
// ========================================

async function uploadRiseGalleryPhotos(files) {

  if (!riseFcIsAdmin) {
    alert("관리자만 사진을 업로드할 수 있습니다.");
    return;
  }

  const { data: { user } } =
    await supabaseClient.auth.getUser();

  if (!user) {
    alert("로그인이 필요합니다.");
    return;
  }

  const fileArray = Array.from(files);

  const validFiles = fileArray.filter(file =>
    file.type.startsWith("image/")
  );

  if (validFiles.length === 0) {
    alert("이미지 파일만 업로드할 수 있습니다.");
    return;
  }

  const caption = prompt(
    "사진 설명을 입력하세요. (비워두면 설명 없이 등록됩니다.)"
  );

  if (caption === null) return;

  const uploadButton =
    document.getElementById("gallery-upload-btn");

  if (uploadButton) {
    uploadButton.disabled = true;
    uploadButton.textContent = "...";
  }

  let successCount = 0;
  const failedFiles = [];

  try {

    for (const file of validFiles) {

      const safeName = file.name.replace(
        /[^\w.-]/g,
        "_"
      );

      const storagePath =
        `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}_${safeName}`;

      try {

        // 사진 파일 업로드
        const { error: uploadError } =
          await supabaseClient.storage
            .from("rise-fc-gallery")
            .upload(storagePath, file, {
              cacheControl: "3600",
              upsert: false
            });

        if (uploadError) throw uploadError;

        const { data: publicData } =
          supabaseClient.storage
            .from("rise-fc-gallery")
            .getPublicUrl(storagePath);

        // 갤러리 데이터 저장
        const { error: insertError } =
          await supabaseClient
            .from("rise_fc_gallery")
            .insert([{
              image_url: publicData.publicUrl,
              storage_path: storagePath,
              caption: caption.trim(),
              created_by: user.id
            }]);

        if (insertError) {

          await supabaseClient.storage
            .from("rise-fc-gallery")
            .remove([storagePath]);

          throw insertError;
        }

        successCount++;

      } catch (error) {

        console.error("사진 업로드 오류:", file.name, error);

        failedFiles.push(file.name);

      }

    }

    await loadRiseGallery();

    if (failedFiles.length === 0) {

      alert(`${successCount}장의 사진이 등록되었습니다!`);

    } else {

      alert(
        `${successCount}장 등록 성공\n` +
        `${failedFiles.length}장 등록 실패\n\n` +
        failedFiles.join("\n")
      );

    }

  } finally {

    if (uploadButton) {
      uploadButton.disabled = false;
      uploadButton.textContent = "+";
    }

  }

}


// ========================================
// 사진 삭제
// ========================================

if (galleryGrid) {

  galleryGrid.addEventListener("click", async event => {

    const deleteButton =
      event.target.closest("[data-delete-photo]");

    if (deleteButton) {

      if (!riseFcIsAdmin) {
        alert("관리자만 사진을 삭제할 수 있습니다.");
        return;
      }

      const id = deleteButton.dataset.deletePhoto;

      if (!confirm("이 사진을 삭제하시겠습니까?")) {
        return;
      }

      const { data: photo, error: findError } =
        await supabaseClient
          .from("rise_fc_gallery")
          .select("storage_path")
          .eq("id", id)
          .single();

      if (findError || !photo) {
        alert("사진 정보를 찾을 수 없습니다.");
        return;
      }

      const { error: deleteError } =
        await supabaseClient
          .from("rise_fc_gallery")
          .delete()
          .eq("id", id);

      if (deleteError) {
        alert("사진 삭제 실패: " + deleteError.message);
        return;
      }

      const { error: storageError } =
        await supabaseClient.storage
          .from("rise-fc-gallery")
          .remove([photo.storage_path]);

      if (storageError) {
        console.error("저장소 사진 삭제 오류:", storageError);
        alert("사진 목록은 삭제했지만 저장소 파일 삭제에 실패했습니다.");
      } else {
        alert("사진이 삭제되었습니다.");
      }

      await loadRiseGallery();

      return;
    }

    // 사진 크게 보기
    const image = event.target.closest("[data-gallery-image]");

    if (image) {

      const viewer = document.getElementById("gallery-viewer");
      const viewerImage =
        document.getElementById("gallery-viewer-image");

      viewerImage.src = image.dataset.galleryImage;
      viewer.classList.add("show");

    }

  });

}


// ========================================
// 사진 크게 보기 닫기
// ========================================

const galleryViewer =
  document.getElementById("gallery-viewer");

const galleryViewerClose =
  document.getElementById("gallery-viewer-close");

galleryViewerClose?.addEventListener("click", () => {
  galleryViewer.classList.remove("show");
});

galleryViewer?.addEventListener("click", event => {

  if (event.target === galleryViewer) {
    galleryViewer.classList.remove("show");
  }

});


// ========================================
// 최초 실행 및 로그인 상태 변경
// ========================================

async function initializeRiseNoticeGallery() {

  await checkRiseFcAdmin();

  await Promise.all([
    loadRiseNotices(),
    loadRiseGallery()
  ]);

}

initializeRiseNoticeGallery();

supabaseClient.auth.onAuthStateChange(() => {

  setTimeout(async () => {

    await checkRiseFcAdmin();

    await Promise.all([
      loadRiseNotices(),
      loadRiseGallery()
    ]);

  }, 0);

});

console.log("RISE FC NOTICE & GALLERY 연결 완료!");
// TOP 버튼
const topButton = document.getElementById("topButton");

if (topButton) {

  function checkTopButton() {
    if (window.scrollY > 300) {
      topButton.classList.add("show");
    } else {
      topButton.classList.remove("show");
    }
  }

  window.addEventListener("scroll", checkTopButton);
  window.addEventListener("load", checkTopButton);

  topButton.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });

  checkTopButton();
}