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
function renderCourses(){const q=search.value.trim().toLowerCase(),cat=filter.value;const list=courses.filter(c=>(cat==='all'||c.category===cat)&&(c.name.toLowerCase().includes(q)||c.desc.toLowerCase().includes(q)));grid.innerHTML=list.length?list.map(c=>'<article class="course-card"><div class="course-top"><div class="course-icon">'+c.short+'</div><span class="course-tag">'+c.tag+'</span></div><h3>'+c.name+'</h3><p>'+c.desc+'</p><div class="course-bottom"><span>'+c.level+' · '+c.lessons+' lecciones</span><b>↗</b></div></article>').join(''):'<div class="empty-state">No encontramos resultados. Prueba con otro término.</div>';document.getElementById('courseCount').textContent=list.length+' de 16 tecnologías';}
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
document.getElementById('mobileMenu').addEventListener('click',()=>{const nav=document.querySelector('.topbar nav');const open=nav.style.display==='flex';nav.style.display=open?'none':'flex';if(!open){nav.style.position='absolute';nav.style.top='67px';nav.style.left='0';nav.style.right='0';nav.style.padding='20px';nav.style.background='#0d1726';nav.style.flexDirection='column';nav.style.borderBottom='1px solid #26364e';}});
