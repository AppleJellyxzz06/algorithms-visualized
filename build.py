import pathlib
r=pathlib.Path('src')
html='''<!DOCTYPE html>
<html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Algorithms แบบเห็นภาพ</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600&family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans+Thai:wght@400;500;600&family=IBM+Plex+Serif:ital,wght@1,400;1,600&display=swap">
<style>
'''+(r/'style.css').read_text(encoding='utf8')+'''</style></head>
<body><div class="app"><nav class="rail" id="rail" aria-label="สารบัญบทเรียน"></nav><main class="wrap" id="main"></main></div>
<script>
'''+(r/'algos.js').read_text(encoding='utf8').replace("if (typeof module !== 'undefined') module.exports","if (0) module.exports")+'\n'+(r/'algos2.js').read_text(encoding='utf8')+'\n'+(r/'lessons.js').read_text(encoding='utf8').replace("if (typeof module !== 'undefined') module.exports","if (0) module.exports")+'\n'+(r/'lessons2.js').read_text(encoding='utf8')+'\n'+(r/'ui.js').read_text(encoding='utf8')+'''</script></body></html>
'''
pathlib.Path('index.html').write_text(html,encoding='utf8')
print(len(html))
