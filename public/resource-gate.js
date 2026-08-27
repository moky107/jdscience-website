(function () {
  try {
    // Keep in sync with RESOURCE_LOGIN_REQUIRED in src/visitorAuth.js
    var REQUIRE_LOGIN = false;
    if (!REQUIRE_LOGIN) return;

    var ua = navigator.userAgent || "";
    if (/Googlebot|bingbot|DuckDuckBot|Yandex|Baiduspider|facebookexternalhit|Twitterbot|Slackbot|LinkedInBot/i.test(ua)) {
      return;
    }
    if (/(?:^|;\s*)jd_signed_in=1(?:;|$)/.test(document.cookie || "")) {
      return;
    }
    var hasSession = false;
    for (var i = 0; i < localStorage.length; i += 1) {
      var key = localStorage.key(i);
      if (!key || key.indexOf("auth-token") === -1) continue;
      var raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        var parsed = JSON.parse(raw);
        var token = parsed && (parsed.access_token || (parsed.currentSession && parsed.currentSession.access_token));
        if (token) {
          hasSession = true;
          break;
        }
      } catch {
        /* ignore a single bad key */
      }
    }
    if (!hasSession) {
      window.location.replace("/papers");
    }
  } catch {
    window.location.replace("/papers");
  }
})();
