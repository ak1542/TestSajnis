/* Sample content + settings for Sajanies Learning.
   Everything the learner site shows comes from this object (or from the admin's saved edits). */
window.SEED = {
  version: 1,
  languages: [
    { code: "en", label: "English", voice: "en-IN" },
    { code: "hi", label: "हिन्दी", voice: "hi-IN" }
  ],
  ui: {
    en: {
      siteName: "Sajanies Learning",
      tagline: "Learn sewing, stitching and pattern making — step by step, with pictures and sound.",
      search: "Search lessons… (try “pattern”)",
      home: "Home",
      startLearning: "Start learning",
      allSections: "What would you like to learn?",
      lessons: "lessons",
      lesson: "lesson",
      listen: "Listen to this lesson",
      stop: "Stop",
      replay: "Replay",
      next: "Next lesson",
      previous: "Previous lesson",
      noResults: "Nothing found. Try another word, like “stitch” or “measure”.",
      results: "Results for",
      emptySection: "Lessons are coming soon here.",
      textSize: "Text size",
      admin: "Teacher login",
      measurements: "Measurements",
      colours: "Tap a colour to try it",
      drag3d: "Drag to turn it around",
      noAudioVoice: "Your device has no voice for this language. Try another language.",
      backTo: "Back to",
      popular: "Good places to begin",
      sections: "Sections",
      onThisPage: "On this page",
      menu: "Menu"
    },
    hi: {
      siteName: "सजनीज़ लर्निंग",
      tagline: "सिलाई, टाँके और पैटर्न बनाना सीखें — आसान क़दमों में, चित्रों और आवाज़ के साथ।",
      search: "पाठ खोजें… (जैसे “पैटर्न”)",
      home: "होम",
      startLearning: "सीखना शुरू करें",
      allSections: "आप क्या सीखना चाहते हैं?",
      lessons: "पाठ",
      lesson: "पाठ",
      listen: "यह पाठ सुनें",
      stop: "रोकें",
      replay: "फिर से देखें",
      next: "अगला पाठ",
      previous: "पिछला पाठ",
      noResults: "कुछ नहीं मिला। कोई दूसरा शब्द आज़माएँ, जैसे “टाँका” या “नाप”।",
      results: "खोज परिणाम:",
      emptySection: "यहाँ जल्द ही पाठ आएँगे।",
      textSize: "अक्षर का आकार",
      admin: "टीचर लॉगिन",
      measurements: "नाप",
      colours: "रंग चुनकर देखें",
      drag3d: "घुमाने के लिए खींचें",
      noAudioVoice: "आपके फ़ोन में इस भाषा की आवाज़ नहीं है। कोई दूसरी भाषा चुनें।",
      backTo: "वापस",
      popular: "यहाँ से शुरू करें",
      sections: "विषय",
      onThisPage: "इस पृष्ठ पर",
      menu: "मेनू"
    }
  },
  sections: [
    { id: "basics", icon: "🧵", color: "#b8553e", title: { en: "Sewing Basics", hi: "सिलाई की मूल बातें" }, blurb: { en: "Tools and first steps", hi: "औज़ार और पहले क़दम" } },
    { id: "stitches", icon: "🪡", color: "#5f8f86", title: { en: "Stitches", hi: "टाँके" }, blurb: { en: "Hand stitches you can do today", hi: "हाथ के टाँके जो आज ही सीखें" } },
    { id: "measurements", icon: "📏", color: "#c28a2c", title: { en: "Measurements", hi: "नाप लेना" }, blurb: { en: "Take the right size, every time", hi: "हर बार सही नाप" } },
    { id: "patterns", icon: "✂️", color: "#8a5a8c", title: { en: "Pattern Making", hi: "पैटर्न बनाना" }, blurb: { en: "From paper pattern to cut cloth", hi: "काग़ज़ के पैटर्न से कटे कपड़े तक" } },
    { id: "fabric", icon: "🎨", color: "#4f7fa8", title: { en: "Fabric & Colour", hi: "कपड़ा और रंग" }, blurb: { en: "Choose cloth and colours well", hi: "कपड़ा और रंग सोच-समझकर चुनें" } }
  ],
  lessons: [
    {
      id: "know-your-tools", sectionId: "basics", status: "published",
      title: { en: "Know your sewing tools", hi: "सिलाई के औज़ार पहचानें" },
      summary: { en: "The 6 things every tailor keeps on the table.", hi: "6 चीज़ें जो हर दर्ज़ी की मेज़ पर होती हैं।" },
      tags: ["tools", "औज़ार", "scissors", "needle", "chalk", "basics"],
      blocks: [
        { type: "text", html: {
          en: "<p>Before you start, keep these tools ready. Having them near you makes sewing calm and easy.</p>",
          hi: "<p>शुरू करने से पहले ये औज़ार पास रखें। सब कुछ पास हो तो सिलाई आसान और शांत रहती है।</p>" } },
        { type: "table", csv: {
          en: "Tool,What it does\nTailor's scissors,Cuts cloth cleanly\nMeasuring tape,Takes body size\nTailor's chalk,Marks lines on cloth\nNeedles,Hand stitching\nThread,Joins the cloth\nPins,Hold cloth in place",
          hi: "औज़ार,काम\nदर्ज़ी की कैंची,कपड़ा साफ़ काटती है\nइंच टेप,शरीर का नाप लेता है\nदर्ज़ी की चॉक,कपड़े पर निशान लगाती है\nसुइयाँ,हाथ की सिलाई\nधागा,कपड़े को जोड़ता है\nपिन,कपड़े को टिकाकर रखती हैं" } },
        { type: "text", html: {
          en: "<p><b>Tip:</b> Use tailor's scissors only on cloth. Cutting paper with them makes them blunt.</p>",
          hi: "<p><b>सुझाव:</b> दर्ज़ी की कैंची से सिर्फ़ कपड़ा काटें। काग़ज़ काटने से वह कुंद हो जाती है।</p>" } }
      ]
    },
    {
      id: "threading-needle", sectionId: "basics", status: "published",
      title: { en: "How to thread a needle", hi: "सुई में धागा कैसे डालें" },
      summary: { en: "Watch it once, then try it yourself.", hi: "एक बार देखें, फिर ख़ुद करके देखें।" },
      tags: ["needle", "thread", "सुई", "धागा", "beginner"],
      blocks: [
        { type: "motion", preset: "threading", caption: { en: "The thread goes through the small hole, called the eye.", hi: "धागा सुई के छोटे छेद से निकलता है, जिसे नाका कहते हैं।" } },
        { type: "text", html: {
          en: "<ol><li>Cut the thread at a slant with scissors.</li><li>Wet the tip a little.</li><li>Hold the needle up against a light.</li><li>Push the thread through the eye.</li><li>Pull about 15 cm through and knot the end.</li></ol>",
          hi: "<ol><li>धागे को तिरछा काटें।</li><li>सिरे को थोड़ा गीला करें।</li><li>सुई को रोशनी की तरफ़ पकड़ें।</li><li>धागे को नाके में डालें।</li><li>लगभग 15 सेमी धागा खींचें और सिरे पर गाँठ लगाएँ।</li></ol>" } }
      ]
    },
    {
      id: "running-stitch", sectionId: "stitches", status: "published",
      title: { en: "Running stitch", hi: "कच्चा टाँका (रनिंग स्टिच)" },
      summary: { en: "The simplest stitch — in and out, in and out.", hi: "सबसे आसान टाँका — ऊपर-नीचे, ऊपर-नीचे।" },
      tags: ["stitch", "टाँका", "running", "beginner", "hand"],
      blocks: [
        { type: "heading", level: 2, text: { en: "Watch the stitch", hi: "टाँका देखें" } },
        { type: "motion", preset: "running-stitch", caption: { en: "The needle goes up and down in a straight line.", hi: "सुई सीधी रेखा में ऊपर-नीचे जाती है।" } },
        { type: "heading", level: 2, text: { en: "When to use it", hi: "कब इस्तेमाल करें" } },
        { type: "text", html: {
          en: "<p>Running stitch is used to join cloth for a short time, or to gather fabric. Keep every stitch the same length — about 3 mm.</p>",
          hi: "<p>कच्चे टाँके से कपड़े को कुछ समय के लिए जोड़ा जाता है या चुन्नट बनाई जाती है। हर टाँका बराबर रखें — लगभग 3 मिमी।</p>" } },
        { type: "heading", level: 2, text: { en: "Listen to the steps", hi: "चरण सुनें" } },
        { type: "audio", url: "", narration: {
          en: "Bring the needle up from below. Take it down a little ahead. Bring it up again. Repeat, keeping the gaps even.",
          hi: "सुई को नीचे से ऊपर लाएँ। थोड़ा आगे जाकर नीचे डालें। फिर ऊपर लाएँ। यही दोहराएँ और दूरी बराबर रखें।" } }
      ]
    },
    {
      id: "hemming", sectionId: "stitches", status: "draft",
      title: { en: "Hemming (draft)", hi: "तुरपाई (ड्राफ़्ट)" },
      summary: { en: "This lesson is still being written.", hi: "यह पाठ अभी लिखा जा रहा है।" },
      tags: ["hem", "तुरपाई"],
      blocks: [ { type: "text", html: { en: "<p>Coming soon.</p>", hi: "<p>जल्द आ रहा है।</p>" } } ]
    },
    {
      id: "body-measurements", sectionId: "measurements", status: "published",
      title: { en: "Taking body measurements", hi: "शरीर का नाप कैसे लें" },
      summary: { en: "Bust, waist, hip and length — the four key numbers.", hi: "छाती, कमर, कूल्हा और लंबाई — चार ज़रूरी नाप।" },
      tags: ["measurement", "नाप", "tape", "size", "bust", "waist"],
      blocks: [
        { type: "heading", level: 2, text: { en: "How to hold the tape", hi: "टेप कैसे पकड़ें" } },
        { type: "motion", preset: "measuring-tape", caption: { en: "Keep the tape snug, not tight.", hi: "टेप को हल्का कसकर रखें, ज़्यादा तंग नहीं।" } },
        { type: "measure", lines: {
          en: "Bust | 36 | in\nWaist | 30 | in\nHip | 38 | in\nKurta length | 42 | in\nSleeve length | 22 | in",
          hi: "छाती | 36 | इंच\nकमर | 30 | इंच\nकूल्हा | 38 | इंच\nकुर्ता लंबाई | 42 | इंच\nआस्तीन लंबाई | 22 | इंच" } },
        { type: "heading", level: 2, text: { en: "Good habits", hi: "अच्छी आदतें" } },
        { type: "text", html: {
          en: "<p>Stand straight and relaxed. Write each number down straight away. Measure twice, cut once.</p>",
          hi: "<p>सीधे और आराम से खड़े हों। हर नाप तुरंत लिख लें। दो बार नापें, एक बार काटें।</p>" } }
      ]
    },
    {
      id: "basic-kurta-pattern", sectionId: "patterns", status: "published",
      title: { en: "Basic kurta pattern", hi: "बेसिक कुर्ता पैटर्न" },
      summary: { en: "Draw, cut and check a simple kurta pattern.", hi: "सादा कुर्ता पैटर्न बनाएँ, काटें और जाँचें।" },
      tags: ["pattern", "पैटर्न", "kurta", "कुर्ता", "cutting", "paper"],
      blocks: [
        { type: "heading", level: 2, text: { en: "What is a pattern?", hi: "पैटर्न क्या है?" } },
        { type: "text", html: {
          en: "<p>A <b>pattern</b> is a paper copy of each piece of the garment. You trace it on cloth, then cut.</p>",
          hi: "<p><b>पैटर्न</b> कपड़े के हर हिस्से की काग़ज़ वाली कॉपी होता है। इसे कपड़े पर उतारकर काटा जाता है।</p>" } },
        { type: "heading", level: 2, text: { en: "Cutting the cloth", hi: "कपड़ा काटना" } },
        { type: "motion", preset: "cutting", caption: { en: "Cut slowly along the line. Keep the cloth flat.", hi: "रेखा पर धीरे-धीरे काटें। कपड़ा सपाट रखें।" } },
        { type: "heading", level: 2, text: { en: "See it in 3D", hi: "3D में देखें" } },
        { type: "model3d", model: "kurta", color: "#b8553e", caption: { en: "3D preview: turn the kurta front and back.", hi: "3D झलक: कुर्ते का आगे और पीछे का हिस्सा घुमाकर देखें।" } },
        { type: "measure", lines: {
          en: "Front length | 42 | in\nShoulder | 14 | in\nChest width (half) | 20 | in\nSeam allowance | 1 | in",
          hi: "आगे की लंबाई | 42 | इंच\nकंधा | 14 | इंच\nछाती की चौड़ाई (आधी) | 20 | इंच\nसिलाई का मार्जिन | 1 | इंच" } }
      ]
    },
    {
      id: "choosing-colours", sectionId: "fabric", status: "published",
      title: { en: "Choosing colours", hi: "रंग चुनना" },
      summary: { en: "Try colours on a kurta before you buy cloth.", hi: "कपड़ा ख़रीदने से पहले कुर्ते पर रंग आज़माएँ।" },
      tags: ["colour", "color", "रंग", "fabric", "कपड़ा"],
      blocks: [
        { type: "colors", colors: ["#b8553e", "#c28a2c", "#5f8f86", "#4f7fa8", "#8a5a8c", "#3a2f2a"], caption: { en: "Tap a colour to see the kurta change.", hi: "रंग दबाएँ और कुर्ते का रंग बदलता देखें।" } },
        { type: "text", html: {
          en: "<p>Warm colours (red, orange, yellow) feel bright and festive. Cool colours (blue, green) feel calm. Dark colours hide stains; light colours show them.</p>",
          hi: "<p>गर्म रंग (लाल, नारंगी, पीला) चमकीले और त्योहार जैसे लगते हैं। ठंडे रंग (नीला, हरा) शांत लगते हैं। गहरे रंग दाग छुपाते हैं, हल्के रंग दिखाते हैं।</p>" } }
      ]
    }
  ]
};
