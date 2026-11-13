const courses=[
{name:"JavaScript",short:"JS",category:"web",tag:"WEB",desc:"Da vida a páginas y aplicaciones interactivas.",level:"Principiante",lessons:12,color:"#f0d66e"},
{name:"Python",short:"Py",category:"general",tag:"GENERAL",desc:"Automatización, datos e inteligencia artificial.",level:"Principiante",lessons:14},
{name:"TypeScript",short:"TS",category:"web",tag:"WEB",desc:"JavaScript con tipos para proyectos escalables.",level:"Principiante",lessons:10},
{name:"Java",short:"Ja",category:"general",tag:"GENERAL",desc:"Domina clases, objetos y aplicaciones robustas.",level:"Principiante",lessons:12},
{name:"C#",short:"C#",category:"general",tag:"GENERAL",desc:"Desarrollo con .NET y fundamentos de videojuegos.",level:"Principiante",lessons:11},
{name:"C++",short:"C++",category:"systems",tag:"SISTEMAS",desc:"Aprende rendimiento, memoria y programación nativa.",level:"Principiante",lessons:13},
{name:"C",short:"C",category:"systems",tag:"SISTEMAS",desc:"Comprende cómo funcionan los programas desde dentro.",level:"Principiante",lessons:10},
{name:"PHP",short:"PHP",category:"web",tag:"WEB",desc:"Construye aplicaciones y servicios del lado del servidor.",level:"Principiante",lessons:10},
{name:"Go",short:"Go",category:"systems",tag:"BACKEND",desc:"Crea servicios rápidos y herramientas concurrentes.",level:"Principiante",lessons:9},
{name:"Rust",short:"Rs",category:"systems",tag:"SISTEMAS",desc:"Explora seguridad de memoria y alto rendimiento.",level:"Principiante",lessons:10},
{name:"Kotlin",short:"Kt",category:"mobile",tag:"MÓVIL",desc:"Desarrolla aplicaciones modernas para Android.",level:"Principiante",lessons:10},
{name:"Swift",short:"Sw",category:"mobile",tag:"MÓVIL",desc:"Conoce el desarrollo de apps para plataformas Apple.",level:"Principiante",lessons:9},
{name:"Lua",short:"Lu",category:"general",tag:"SCRIPTING",desc:"Programa scripts y experimenta con videojuegos.",level:"Principiante",lessons:8},
{name:"SQL",short:"SQL",category:"data",tag:"DATOS",desc:"Consulta, organiza y administra bases de datos.",level:"Principiante",lessons:10},
{name:"HTML",short:"<>",category:"web",tag:"WEB",desc:"Construye la estructura de páginas web.",level:"Principiante",lessons:8},
{name:"CSS",short:"CSS",category:"web",tag:"WEB",desc:"Diseña interfaces, estilos y experiencias adaptables.",level:"Principiante",lessons:9}
];
const grid=document.getElementById('courseGrid'),search=document.getElementById('searchInput'),filter=document.getElementById('categoryFilter');
function renderCourses(){const q=search.value.trim().toLowerCase(),cat=filter.value;const list=courses.filter(c=>(cat==='all'||c.category===cat)&&(c.name.toLowerCase().includes(q)||c.desc.toLowerCase().includes(q)));grid.innerHTML=list.length?list.map(c=>'<article class="course-card"><div class="course-top"><div class="course-icon">'+c.short+'</div><span class="course-tag">'+c.tag+'</span></div><h3>'+c.name+'</h3><p>'+c.desc+'</p><div class="course-bottom"><span>'+c.level+'</span><b>↗</b></div></article>').join(''):'<div class="empty-state">No encontramos resultados. Prueba con otro término.</div>';document.getElementById('courseCount').textContent=list.length+' de 16 tecnologías';}
search.addEventListener('input',renderCourses);filter.addEventListener('change',renderCourses);renderCourses();
const examples={
javascript:{code:'const nombre = "CODELAB";\nconst nivel = "principiante";\n\nconsole.log("Hola, " + nombre);',tip:'En JavaScript, const declara una variable cuyo valor no se reasigna.'},
python:{code:'nombre = "CODELAB"\nnivel = "principiante"\n\nprint("Hola, " + nombre)',tip:'Python usa una sintaxis sencilla. print() muestra información en la salida.'},
java:{code:'public class Main {\n  public static void main(String[] args) {\n    String nombre = "CODELAB";\n    System.out.println("Hola, " + nombre);\n  }\n}',tip:'En Java, el código se organiza en clases y el método main es el punto de entrada.'},
html:{code:'<main>\n  <h1>Hola, CODELAB</h1>\n  <p>Mi primera página.</p>\n</main>',tip:'HTML define la estructura y el significado del contenido de una página web.'}
};
const editor=document.getElementById('codeEditor'),language=document.getElementById('languageSelect'),gutter=document.getElementById('lineNumbers');
function setExample(){const ex=examples[language.value];editor.value=ex.code;document.getElementById('codeTip').textContent=ex.tip;updateLines();}
function updateLines(){gutter.innerHTML=editor.value.split('\n').map((_,i)=>i+1).join('<br>');}
language.addEventListener('change',setExample);editor.addEventListener('input',updateLines);setExample();
const toast=document.getElementById('toast');let toastTimer;function notify(msg){toast.textContent=msg;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2200);}
document.getElementById('copyCode').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(editor.value);notify('Código copiado al portapapeles.');}catch{editor.select();notify('Selecciona y copia el código.');}});
document.getElementById('profileBtn').addEventListener('click',()=>notify('El perfil de estudiante llegará en una próxima versión.'));
const mobileMenu=document.getElementById('mobileMenu'),primaryNav=document.getElementById('primaryNav');
mobileMenu.addEventListener('click',()=>{const open=mobileMenu.getAttribute('aria-expanded')==='true';mobileMenu.setAttribute('aria-expanded',String(!open));primaryNav.style.display=open?'none':'flex';if(!open){primaryNav.style.position='absolute';primaryNav.style.top='67px';primaryNav.style.left='0';primaryNav.style.right='0';primaryNav.style.padding='20px';primaryNav.style.background='#0d1726';primaryNav.style.flexDirection='column';primaryNav.style.borderBottom='1px solid #26364e';}});
primaryNav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{if(window.matchMedia('(max-width: 600px)').matches){primaryNav.style.display='none';mobileMenu.setAttribute('aria-expanded','false');}}));

const gamePanel=document.getElementById('gamePanel'),challengePanel=document.getElementById('challengePanel');
document.getElementById('startGame').addEventListener('click',()=>{gameQuestionIndex=0;renderGameQuestion();gamePanel.hidden=false;challengePanel.hidden=true;gamePanel.scrollIntoView({behavior:'smooth',block:'center'});});
document.getElementById('startChallenge').addEventListener('click',()=>{challengePanel.hidden=false;gamePanel.hidden=true;challengePanel.scrollIntoView({behavior:'smooth',block:'center'});});
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>document.getElementById(b.dataset.close).hidden=true));
const gameQuestions=[
{question:'¿Qué instrucción muestra un mensaje en JavaScript?',answers:[['alert()','alert()'],['print()','print()'],['echo','echo']],correct:'alert()',success:'¡Correcto! alert() abre un cuadro de diálogo en el navegador.',failure:'No exactamente. alert() muestra un cuadro de diálogo.'},
{question:'¿Qué tipo de dato representa "Hola" en JavaScript?',answers:[['string','String (texto)'],['number','Number (número)'],['boolean','Boolean (lógico)']],correct:'string',success:'¡Correcto! "Hola" es una cadena de texto (string).',failure:'La respuesta correcta es String: representa texto.'},
{question:'¿Qué palabra declara una variable que puede cambiar en JavaScript?',answers:[['const','const'],['let','let'],['class','class']],correct:'let',success:'¡Correcto! let declara una variable cuyo valor puede cambiar.',failure:'La respuesta correcta es let: permite reasignar el valor de la variable.'}
];
let gameQuestionIndex=0;
function renderGameQuestion(){
const question=gameQuestions[gameQuestionIndex];
document.getElementById('gameQuestion').textContent=question.question;
document.getElementById('gameAnswers').innerHTML=question.answers.map(([value,label])=>'<button data-answer="'+value+'">'+label+'</button>').join('');
document.getElementById('gameFeedback').textContent='Selecciona una respuesta.';
document.getElementById('gameFeedback').className='panel-feedback';
document.getElementById('nextQuestion').textContent=gameQuestionIndex===gameQuestions.length-1?'Reiniciar ronda ↻':'Siguiente pregunta ↗';
}
document.getElementById('gameAnswers').addEventListener('click',e=>{
const b=e.target.closest('button[data-answer]');
if(!b||b.disabled)return;
document.querySelectorAll('#gameAnswers button').forEach(x=>x.disabled=true);
const question=gameQuestions[gameQuestionIndex],ok=b.dataset.answer===question.correct;
const feedback=document.getElementById('gameFeedback');
feedback.textContent=ok?question.success:question.failure;
feedback.className='panel-feedback '+(ok?'correct':'incorrect');
});
document.getElementById('nextQuestion').addEventListener('click',()=>{
gameQuestionIndex=(gameQuestionIndex+1)%gameQuestions.length;
renderGameQuestion();
});
renderGameQuestion();
document.getElementById('challengeAnswers').addEventListener('click',e=>{const b=e.target.closest('button[data-answer]');if(!b)return;document.querySelectorAll('#challengeAnswers button').forEach(x=>x.disabled=true);const ok=b.dataset.answer==='32',f=document.getElementById('challengeFeedback');f.textContent=ok?'¡Bien! Cada número se multiplica por 2.':'Pista: cada término es el doble del anterior. La respuesta es 32.';f.className='panel-feedback '+(ok?'correct':'incorrect');});
const titleInput=document.getElementById('creatorTitle'),descInput=document.getElementById('creatorDescription'),colorInput=document.getElementById('creatorColor');
function updatePreview(){document.getElementById('previewTitle').textContent=titleInput.value||'Mi primer proyecto';document.getElementById('previewDescription').textContent=descInput.value||'Una idea que estoy construyendo.';document.getElementById('creatorPreview').style.setProperty('--accent',colorInput.value);}
[titleInput,descInput,colorInput].forEach(el=>el.addEventListener('input',updatePreview));updatePreview();
const storageKey='codelab-projects-v1';
function getProjects(){try{const v=JSON.parse(localStorage.getItem(storageKey)||'[]');return Array.isArray(v)?v:[];}catch{return [];}}
function renderProjects(){const projects=getProjects(),target=document.getElementById('savedProjects');document.getElementById('savedCount').textContent=projects.length+' guardados';if(!projects.length){target.innerHTML='<div class="empty-projects">Todavía no guardas proyectos. Crea una tarjeta en Creator Studio para comenzar.</div>';return;}target.innerHTML=projects.map(p=>'<article class="saved-project"><h3>'+escapeText(p.title)+'</h3><p>'+escapeText(p.description)+'</p><small>'+escapeText(p.date)+'</small></article>').join('');}
function escapeText(value){return String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
document.getElementById('saveCreator').addEventListener('click',()=>{const projects=getProjects();if(projects.length>=30){notify('Has llegado al límite de 30 proyectos guardados en este navegador.');return;}projects.unshift({title:titleInput.value.trim()||'Proyecto sin título',description:descInput.value.trim()||'Sin descripción',date:new Date().toLocaleDateString('es-MX')});try{localStorage.setItem(storageKey,JSON.stringify(projects));renderProjects();notify('Proyecto guardado en este dispositivo.');}catch{notify('No se pudo guardar. Revisa el almacenamiento del navegador.');}});
renderProjects();
