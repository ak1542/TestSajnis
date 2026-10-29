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
  sections: [],
  lessons: []
};

/* ---------- Section: My Designs (the teacher's nine drawings) ---------- */
(function () {
  const S = window.SEED;
  const ul = (a) => "<ul>" + a.map((x) => "<li>" + x + "</li>").join("") + "</ul>";
  const H = (en, hi) => ({ type: "heading", level: 2, text: { en: en, hi: hi } });

  S.sections = [{
    id: "my-designs", icon: "👗", color: "#a05a8c",
    title: { en: "My Designs", hi: "मेरे डिज़ाइन" },
    blurb: { en: "Nine original designs, with colours and sewing tips", hi: "नौ मौलिक डिज़ाइन, रंग और सिलाई के सुझावों के साथ" }
  }];

  const THEME = {
    dots: { en: "Dots", hi: "बिंदियाँ" },
    lines: { en: "Lines", hi: "धारियाँ" },
    motifs: { en: "Motifs", hi: "मोटिफ़" }
  };

  const DESIGNS = [
    { n: "01", theme: "dots",
      title: { en: "Yellow polka high-low dress", hi: "पीली पोल्का हाई-लो ड्रेस" },
      notes: { en: ["Sweetheart neckline with frilled flutter sleeves on the shoulders.", "A wrapped, ruched band at the waist makes the waist look slim.", "Flared skirt with a high-low hem: short at the front, longer at the back.", "Orange dots scattered on sunny yellow keep it playful."],
               hi: ["दिल के आकार (स्वीटहार्ट) की नेकलाइन और कंधों पर फ्रिल वाली छोटी बाँहें।", "कमर पर लपेटी हुई चुन्नट वाली पट्टी कमर को पतला दिखाती है।", "घेरदार स्कर्ट, हाई-लो हेम — आगे से छोटी, पीछे से लंबी।", "पीले रंग पर बिखरी नारंगी बिंदियाँ इसे चुलबुला बनाती हैं।"] },
      colors: ["#f2c230", "#ec7a2e"], names: { en: "Sunny yellow\nOrange", hi: "धूप जैसा पीला\nनारंगी" },
      tips: { en: ["Choose light cotton, poplin or crepe so the flare falls softly.", "Cut the front of the skirt shorter and the back longer, then finish with a narrow rolled hem.", "Place the dots so they are not cut in half at the seams, especially at the neckline."],
              hi: ["हल्का सूती, पॉपलिन या क्रेप कपड़ा चुनें ताकि घेर नरम गिरे।", "स्कर्ट का आगे का हिस्सा छोटा और पीछे का लंबा काटें, फिर बारीक मोड़कर हेम सिलें।", "बिंदियाँ ऐसे रखें कि सिलाई की रेखा पर आधी न कटें, ख़ासकर नेकलाइन पर।"] },
      tags: ["dots", "polka", "dress", "high-low", "sweetheart", "ruffle", "yellow", "बिंदी", "पोल्का", "पीला", "ड्रेस"] },

    { n: "02", theme: "dots",
      title: { en: "Pink puff-sleeve mini dress", hi: "गुलाबी पफ-स्लीव मिनी ड्रेस" },
      notes: { en: ["Sweetheart neckline with big puffed sleeves.", "Ruched wrap at the waist and a short, full skirt.", "Navy dots on soft pink: a sweet colour pair with strong contrast."],
               hi: ["दिल के आकार की नेकलाइन और बड़ी फूली हुई (पफ) बाँहें।", "कमर पर चुन्नट वाला रैप और छोटी, घेरदार स्कर्ट।", "हल्के गुलाबी पर गहरी नीली बिंदियाँ: मीठी जोड़ी और साफ़ कंट्रास्ट।"] },
      colors: ["#eab6d8", "#2b2d77"], names: { en: "Soft pink\nNavy", hi: "हल्का गुलाबी\nगहरा नीला" },
      tips: { en: ["For puff sleeves, cut extra width at the top of the sleeve and gather it with two rows of long stitches.", "Line or interface the sweetheart neckline so it keeps its shape.", "Gather or pleat the short skirt for a fuller shape."],
              hi: ["पफ बाँह के ऊपरी हिस्से में ज़्यादा चौड़ाई रखें और दो लाइन कच्चे टाँकों से चुन्नट डालें।", "स्वीटहार्ट नेकलाइन में अस्तर या इंटरफ़ेसिंग लगाएँ ताकि आकार बना रहे।", "छोटी स्कर्ट में चुन्नट या प्लीट डालें ताकि घेर भरा-भरा लगे।"] },
      tags: ["dots", "puff sleeve", "mini", "dress", "pink", "बिंदी", "गुलाबी", "पफ", "मिनी"] },

    { n: "03", theme: "dots",
      title: { en: "Green ruched bodycon midi", hi: "हरी रूच्ड बॉडीकॉन मिडी" },
      notes: { en: ["Scoop neckline with wide shoulder straps.", "Ruching along the side draws the eye along the body.", "Close-fitting from chest to below the knee.", "Small red dots on soft green."],
               hi: ["गोल गले की नेकलाइन और चौड़े कंधे के स्ट्रैप।", "बगल में चुन्नट (रूचिंग) नज़र को शरीर की रेखा के साथ ले जाती है।", "छाती से घुटने के नीचे तक कसी हुई फ़िटिंग।", "हल्के हरे पर छोटी लाल बिंदियाँ।"] },
      colors: ["#7fbf8a", "#d94545"], names: { en: "Soft green\nRed", hi: "हल्का हरा\nलाल" },
      tips: { en: ["Use a stretch fabric such as jersey so the dress fits close and moves with you.", "Make the ruching with a gathered side seam or elastic thread.", "Fitted designs show every error, so take measurements carefully."],
              hi: ["जर्सी जैसा स्ट्रेच कपड़ा लें ताकि ड्रेस कसी रहे और आराम से चले।", "रूचिंग के लिए बगल की सिलाई में चुन्नट डालें या इलास्टिक धागा इस्तेमाल करें।", "कसी हुई डिज़ाइन में हर ग़लती दिखती है, इसलिए नाप ध्यान से लें।"] },
      tags: ["dots", "bodycon", "ruched", "midi", "dress", "green", "बिंदी", "हरा", "रूचिंग", "बॉडीकॉन"] },

    { n: "04", theme: "lines",
      title: { en: "Pink pleated midi with chevron bodice", hi: "गुलाबी प्लीटेड मिडी, शेवरॉन चोली" },
      notes: { en: ["High neck and long puffed sleeves with fitted cuffs.", "Chevron (V-shaped) stripes on the bodice meet at the centre.", "Pleated midi skirt with straight stripes and a slightly slanted hem.", "Two pinks: a strong pink and a pale pink."],
               hi: ["ऊँचा गला और लंबी फूली बाँहें, कलाई पर कसे कफ़।", "चोली पर शेवरॉन (V आकार) धारियाँ बीच में मिलती हैं।", "प्लीटेड मिडी स्कर्ट, सीधी धारियाँ और हल्का तिरछा हेम।", "दो गुलाबी रंग: गहरा और हल्का।"] },
      colors: ["#d9488f", "#f8d9e6"], names: { en: "Strong pink\nPale pink", hi: "गहरा गुलाबी\nहल्का गुलाबी" },
      tips: { en: ["Match the chevron stripes exactly at the centre-front seam.", "Press the pleats well before stitching them down at the waist.", "Light, sheer-looking sleeves work best in a soft fabric such as georgette or voile."],
              hi: ["बीच की सिलाई पर शेवरॉन धारियाँ बिल्कुल मिलाकर रखें।", "कमर पर सिलने से पहले प्लीट्स को अच्छी तरह प्रेस करें।", "हल्की गुलाबी बाँहों के लिए जॉर्जेट या वॉयल जैसा हल्का कपड़ा अच्छा रहता है।"] },
      tags: ["lines", "stripes", "chevron", "pleated", "pleats", "midi", "pink", "धारी", "प्लीट", "शेवरॉन", "गुलाबी"] },

    { n: "05", theme: "lines",
      title: { en: "Blue diagonal-stripe jumpsuit", hi: "नीला तिरछी धारियों वाला जंपसूट" },
      notes: { en: ["V-neck with thin shoulder straps.", "A belt with a buckle defines the waist.", "Diagonal stripes make the body look long.", "Legs gather into cuffs at the ankle."],
               hi: ["V गला और पतले कंधे के स्ट्रैप।", "बकल वाली बेल्ट कमर को उभारती है।", "तिरछी धारियाँ शरीर को लंबा दिखाती हैं।", "पैर टखने पर कफ़ में सिमट जाते हैं।"] },
      colors: ["#3b8fc6", "#1f6fa8"], names: { en: "Sky blue\nDeep blue", hi: "आसमानी नीला\nगहरा नीला" },
      tips: { en: ["Cut diagonal stripes carefully and mirror them on the two legs so they match.", "Stay-stitch the V-neckline so it does not stretch.", "Put elastic inside the ankle cuffs."],
              hi: ["तिरछी धारियाँ ध्यान से काटें और दोनों पैरों में एक-जैसी (मिरर) रखें।", "V गले की किनारी पर पहले सीधा टाँका लगाएँ ताकि वह खिंचे नहीं।", "टखने के कफ़ में इलास्टिक डालें।"] },
      tags: ["lines", "stripes", "diagonal", "jumpsuit", "belt", "blue", "धारी", "जंपसूट", "नीला", "तिरछी"] },

    { n: "06", theme: "lines",
      title: { en: "Striped wrap dress with ruffle hem", hi: "धारीदार रैप ड्रेस, रफल हेम" },
      notes: { en: ["Wrap front with a deep V neck and a tie at the waist.", "Flutter sleeves.", "Vertical stripes in purple and black make it look tall and slim.", "Ruffled hem, short in front and long at the back."],
               hi: ["आगे से रैप, गहरा V गला और कमर पर बाँधने की डोरी।", "फड़फड़ाती (फ्लटर) छोटी बाँहें।", "बैंगनी और काली सीधी धारियाँ ऊँचाई और पतलापन दिखाती हैं।", "रफल वाला हेम — आगे छोटा, पीछे लंबा।"] },
      colors: ["#9b7bc9", "#1b1722"], names: { en: "Purple\nBlack", hi: "बैंगनी\nकाला" },
      tips: { en: ["Give the wrap enough overlap so it stays closed when you move.", "Cut stripes along the straight grain so they hang straight.", "Cut the hem ruffle as a curved strip so it ripples naturally."],
              hi: ["रैप में पर्याप्त ओवरलैप रखें ताकि चलने पर खुल न जाए।", "धारियाँ कपड़े के सीधे धागे की दिशा में काटें ताकि सीधी लटकें।", "हेम की रफल को गोलाई वाली पट्टी की तरह काटें ताकि लहरें अपने आप बनें।"] },
      tags: ["lines", "stripes", "wrap", "ruffle", "dress", "purple", "धारी", "रैप", "रफल", "बैंगनी"] },

    { n: "07", theme: "motifs",
      title: { en: "Blue heart blouse with orange shorts", hi: "नीला हार्ट ब्लाउज और नारंगी शॉर्ट्स" },
      notes: { en: ["Loose blouse with a small notch neckline.", "Balloon sleeves gathered into cuffs near the elbow.", "Dark heart motifs spread over blue.", "Orange shorts with a patch pocket and turned-up cuffs add a bright contrast."],
               hi: ["ढीला ब्लाउज, छोटी कट वाली नेकलाइन।", "कोहनी के पास कफ़ में सिमटी गुब्बारे जैसी बाँहें।", "नीले रंग पर फैले गहरे हार्ट मोटिफ़।", "नारंगी शॉर्ट्स — पैच पॉकेट और मुड़े हुए कफ़ — चमकीला कंट्रास्ट देते हैं।"] },
      colors: ["#2b86c5", "#ee8a45"], names: { en: "Blue\nOrange", hi: "नीला\nनारंगी" },
      tips: { en: ["Print or block-print the hearts, and keep one heart centred at the front.", "Cotton twill works well for shorts and holds the cuff fold.", "Sew the patch pocket on before closing the side seams."],
              hi: ["हार्ट प्रिंट या ब्लॉक-प्रिंट करें और एक हार्ट आगे के बीच में रखें।", "शॉर्ट्स के लिए कॉटन ट्विल अच्छा रहता है और कफ़ का मोड़ टिका रहता है।", "साइड सिलाई बंद करने से पहले पैच पॉकेट लगाएँ।"] },
      tags: ["motif", "motifs", "heart", "blouse", "shorts", "blue", "orange", "मोटिफ़", "हार्ट", "ब्लाउज", "शॉर्ट्स"] },

    { n: "08", theme: "motifs",
      title: { en: "Plunge peplum with red mini", hi: "प्लंज पेप्लम टॉप और लाल मिनी" },
      notes: { en: ["Deep V plunge neckline.", "Long bishop-style sleeves gathered at the wrist.", "A flared peplum frill at the waist.", "Small red triangle motifs on lime-yellow, balanced by a plain red mini skirt."],
               hi: ["गहरा V (प्लंज) गला।", "कलाई पर सिमटी लंबी बिशप जैसी बाँहें।", "कमर पर घेरदार पेप्लम फ्रिल।", "हरे-पीले रंग पर छोटे लाल त्रिकोण मोटिफ़, साथ में सादी लाल मिनी स्कर्ट।"] },
      colors: ["#c4d437", "#e0503a", "#e8444a"], names: { en: "Lime yellow\nRed motif\nRed skirt", hi: "हरा-पीला\nलाल मोटिफ़\nलाल स्कर्ट" },
      tips: { en: ["Finish the plunge neckline with a facing or stay tape so it lies flat.", "Cut the peplum as a circle or half circle for an even flare.", "Keep motifs small near the V so it does not look crowded."],
              hi: ["प्लंज गले पर फेसिंग या टेप लगाएँ ताकि वह सपाट बैठे।", "पेप्लम को पूरे या आधे गोले की तरह काटें ताकि घेर बराबर आए।", "V के पास मोटिफ़ छोटे रखें ताकि भीड़-भाड़ न लगे।"] },
      tags: ["motif", "motifs", "peplum", "plunge", "top", "skirt", "red", "मोटिफ़", "पेप्लम", "लाल", "टॉप"] },

    { n: "09", theme: "motifs",
      title: { en: "Purple asymmetric ring-dot dress", hi: "बैंगनी असममित रिंग-डॉट ड्रेस" },
      notes: { en: ["Round neck with puffed sleeves.", "Fitted bodice with vertical seams and a waist seam.", "Skirt with a slanted hem that is longer on one side.", "Dark ring-shaped dots on lavender."],
               hi: ["गोल गला और फूली हुई बाँहें।", "चोली में खड़ी सिलाइयाँ और कमर पर जोड़।", "तिरछे हेम वाली स्कर्ट, एक तरफ़ से लंबी।", "हल्के बैंगनी पर गहरे रिंग जैसे बिंदु।"] },
      colors: ["#a58fd8", "#1f2257"], names: { en: "Lavender\nNavy", hi: "हल्का बैंगनी\nगहरा नीला" },
      tips: { en: ["Mark the slanted hem while the dress is on a dress form or being worn, then cut the longer side first.", "Draw ring motifs the same size so the pattern looks even.", "A soft, draping fabric makes the slanted hem fall nicely."],
              hi: ["तिरछा हेम पहनकर या ड्रेस-फ़ॉर्म पर निशान लगाएँ, फिर पहले लंबा हिस्सा काटें।", "रिंग मोटिफ़ एक-जैसे आकार के रखें ताकि पैटर्न बराबर दिखे।", "नरम, गिरने वाला कपड़ा तिरछे हेम को सुंदर बनाता है।"] },
      tags: ["motif", "motifs", "rings", "asymmetric", "dress", "purple", "मोटिफ़", "बैंगनी", "ड्रेस", "असममित"] }
  ];

  S.lessons = DESIGNS.map((d) => ({
    id: "design-" + d.n, sectionId: "my-designs", status: "published",
    title: { en: d.n + " · " + d.title.en, hi: d.n + " · " + d.title.hi },
    summary: { en: THEME[d.theme].en + " — your design, colours and sewing tips", hi: THEME[d.theme].hi + " — आपका डिज़ाइन, रंग और सिलाई के सुझाव" },
    tags: d.tags,
    blocks: [
      H("Your design", "आपका डिज़ाइन"),
      { type: "image", url: "images/designs/d" + d.n + ".jpg", caption: { en: "Your original drawing.", hi: "आपका मूल चित्र।" } },
      H("What makes it special", "इसकी ख़ास बातें"),
      { type: "text", html: { en: ul(d.notes.en), hi: ul(d.notes.hi) } },
      H("Colours", "रंग"),
      { type: "colors", preview: false, colors: d.colors, names: d.names, caption: {} },
      H("Sewing tips", "सिलाई के सुझाव"),
      { type: "text", html: { en: ul(d.tips.en), hi: ul(d.tips.hi) } }
    ]
  }));
})();
