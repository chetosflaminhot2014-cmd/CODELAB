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
function renderCourses(){const q=search.value.trim().toLowerCase(),cat=filter.value;const list=courses.filter(c=>(cat==='all'||c.category===cat)&&(c.name.toLowerCase().includes(q)||c.desc.toLowerCase().includes(q)));grid.innerHTML=list.length?list.map(c=>'<article class="course-card" role="button" tabindex="0" data-course="'+c.name+'" aria-label="Ver ruta de '+c.name+'"><div class="course-top"><div class="course-icon">'+c.short+'</div><span class="course-tag">'+c.tag+'</span></div><h3>'+c.name+'</h3><p>'+c.desc+'</p><div class="course-bottom"><span>'+c.level+'</span><b>↗</b></div></article>').join(''):'<div class="empty-state">No encontramos resultados. Prueba con otro término.</div>';document.getElementById('courseCount').textContent=list.length+' de 16 tecnologías';}
search.addEventListener('input',renderCourses);filter.addEventListener('change',renderCourses);renderCourses();
const examples={
javascript:{code:'const nombre = "OKNEW";\nconst nivel = "principiante";\n\nconsole.log("Hola, " + nombre);',tip:'En JavaScript, const declara una variable cuyo valor no se reasigna.'},
python:{code:'nombre = "OKNEW"\nnivel = "principiante"\n\nprint("Hola, " + nombre)',tip:'Python usa una sintaxis sencilla. print() muestra información en la salida.'},
java:{code:'public class Main {\n  public static void main(String[] args) {\n    String nombre = "OKNEW";\n    System.out.println("Hola, " + nombre);\n  }\n}',tip:'En Java, el código se organiza en clases y el método main es el punto de entrada.'},
html:{code:'<main>\n  <h1>Hola, OKNEW</h1>\n  <p>Mi primera página.</p>\n</main>',tip:'HTML define la estructura y el significado del contenido de una página web.'}
};
const editor=document.getElementById('codeEditor'),language=document.getElementById('languageSelect'),gutter=document.getElementById('lineNumbers');
function setExample(){const ex=examples[language.value];editor.value=ex.code;document.getElementById('codeTip').textContent=ex.tip;updateLines();}
function updateLines(){gutter.innerHTML=editor.value.split('\n').map((_,i)=>i+1).join('<br>');}
language.addEventListener('change',setExample);editor.addEventListener('input',updateLines);setExample();
grid.addEventListener('click',e=>{const card=e.target.closest('[data-course]');if(card)openCourse(card.dataset.course);});
grid.addEventListener('keydown',e=>{const card=e.target.closest('[data-course]');if(card&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openCourse(card.dataset.course);}});

const lessonLibrary={
 JavaScript:[
  {title:'Variables: let y const',goal:'Guardar información y elegir cómo declararla.',explanation:'Una variable es un nombre asociado a un valor. Usa const cuando no reasignarás ese valor y let cuando necesites cambiarlo. Los nombres deben describir lo que guardan.',code:'const nombre = "Ada";\nlet puntos = 0;\npuntos = puntos + 1;\nconsole.log(nombre, puntos);',task:'¿Qué palabra usarías para una variable cuyo valor cambiará?',answers:['const','let','class'],correct:1,why:'let permite reasignar el valor de la variable.'},
  {title:'Mostrar información',goal:'Enviar mensajes a la consola del navegador.',explanation:'console.log() escribe información en la consola. Es útil para observar valores y revisar lo que hace un programa mientras aprendes.',code:'const mensaje = "Hola, OKNEW";\nconsole.log(mensaje);',task:'¿Cuál instrucción escribe un mensaje en la consola?',answers:['console.log()','print()','echo()'],correct:0,why:'console.log() muestra el valor en la consola de JavaScript.'},
  {title:'Tomar decisiones con if',goal:'Ejecutar código según una condición.',explanation:'Una condición se evalúa como verdadera o falsa. El bloque if se ejecuta si la condición es verdadera; else permite indicar qué hacer en caso contrario.',code:'const puntos = 12;\nif (puntos >= 10) {\n  console.log("Nivel avanzado");\n} else {\n  console.log("Sigue practicando");\n}',task:'Si puntos vale 12, ¿qué bloque se ejecuta?',answers:['El bloque if','El bloque else','Ninguno'],correct:0,why:'12 es mayor o igual que 10, así que la condición es verdadera.'}
 ],
 Python:[
  {title:'Variables y valores',goal:'Guardar datos con nombres claros.',explanation:'En Python creas una variable asignándole un valor con el signo igual. El tipo de dato se determina a partir del valor que asignas.',code:'nombre = "Ada"\npuntos = 0\npuntos = puntos + 1\nprint(nombre, puntos)',task:'¿Cómo asignas el texto Ada a la variable nombre?',answers:['nombre = "Ada"','let nombre = "Ada"','String nombre("Ada")'],correct:0,why:'En Python basta con escribir el nombre, el signo igual y el valor.'},
  {title:'Mostrar información con print',goal:'Mostrar texto y valores.',explanation:'La función print() muestra información en la salida. Puedes pasarle texto, variables o varios valores separados por comas.',code:'lenguaje = "Python"\nprint("Estoy aprendiendo", lenguaje)',task:'¿Qué función muestra el mensaje en pantalla?',answers:['console.log()','print()','echo()'],correct:1,why:'print() es la función habitual para mostrar información en Python.'},
  {title:'Condiciones con if',goal:'Elegir qué instrucciones ejecutar.',explanation:'Python usa if para comprobar una condición. Los dos puntos indican que comienza un bloque y la indentación señala qué instrucciones pertenecen a él.',code:'puntos = 12\nif puntos >= 10:\n    print("Nivel avanzado")\nelse:\n    print("Sigue practicando")',task:'¿Qué símbolo va al final de la línea if en Python?',answers:[';','{',':'],correct:2,why:'En Python se escribe dos puntos y luego se indenta el bloque.'}
 ],
 Java:[
  {title:'La estructura de un programa',goal:'Reconocer la clase y el método main.',explanation:'En Java, el código se organiza en clases. En una aplicación sencilla, el método main es el punto de entrada desde el que comienza el programa.',code:'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hola");\n    }\n}',task:'¿Cómo se llama la clase del ejemplo?',answers:['Program','Main','Start'],correct:1,why:'La declaración public class Main define una clase llamada Main.'},
  {title:'Tipos y variables',goal:'Declarar variables con un tipo.',explanation:'Java es un lenguaje de tipado estático. Al declarar una variable indicas su tipo, por ejemplo String para texto e int para números enteros.',code:'String nombre = "Ada";\nint puntos = 10;\nSystem.out.println(nombre);',task:'¿Qué tipo se usa para guardar texto?',answers:['int','boolean','String'],correct:2,why:'String representa una cadena de texto.'},
  {title:'Mostrar información',goal:'Imprimir texto en la consola.',explanation:'System.out.println() escribe un valor y termina la línea. Es una forma común de mostrar resultados en programas de consola Java.',code:'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Estoy aprendiendo Java");\n    }\n}',task:'¿Qué instrucción imprime una línea en Java?',answers:['print()','System.out.println()','console.log()'],correct:1,why:'System.out.println() pertenece a la salida estándar de Java.'}
 ],
 HTML:[
  {title:'Estructura de una página',goal:'Organizar contenido con elementos HTML.',explanation:'HTML describe la estructura del contenido. Los elementos suelen tener una etiqueta de apertura, contenido y una etiqueta de cierre. main representa el contenido principal.',code:'<main>\n  <h1>Mi primera página</h1>\n  <p>Estoy aprendiendo HTML.</p>\n</main>',task:'¿Qué etiqueta representa el encabezado principal?',answers:['<p>','<h1>','<main>'],correct:1,why:'h1 representa el encabezado principal de la página o sección.'},
  {title:'Atributos',goal:'Añadir información a los elementos.',explanation:'Los atributos aparecen dentro de la etiqueta de apertura y configuran un elemento. Por ejemplo, src indica el recurso de una imagen y alt ofrece un texto alternativo.',code:'<img src="foto.jpg" alt="Paisaje de montaña">',task:'¿Qué atributo aporta texto alternativo a una imagen?',answers:['src','href','alt'],correct:2,why:'alt proporciona una descripción textual alternativa.'},
  {title:'Crear enlaces',goal:'Conectar una página con otra.',explanation:'El elemento a crea un enlace. El atributo href indica el destino y el texto entre las etiquetas es lo que verá la persona.',code:'<a href="https://example.com">Visitar sitio</a>',task:'¿Qué atributo indica el destino del enlace?',answers:['href','src','title'],correct:0,why:'href contiene la dirección de destino del enlace.'}
 ]
};
const learningStorageKey='codelab-learning-progress-v1';
function getLearningProgress(){try{const value=JSON.parse(localStorage.getItem(learningStorageKey)||'{}');return value&&typeof value==='object'&&!Array.isArray(value)?value:{};}catch{return {};}}
function saveLearningProgress(value){try{localStorage.setItem(learningStorageKey,JSON.stringify(value));return true;}catch{return false;}}
let activeCourseName='',activeLessonIndex=0,activeLessonSolved=false;
function openCourse(name){
 const course=courses.find(item=>item.name===name);if(!course)return;
 let modal=document.getElementById('courseDialog');
 if(!modal){modal=document.createElement('div');modal.id='courseDialog';modal.className='course-dialog';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-labelledby','courseDialogTitle');document.body.appendChild(modal);}
 activeCourseName=name;activeLessonIndex=0;activeLessonSolved=false;
 renderCourseLesson();
 modal.hidden=false;
 modal.onclick=e=>{
  if(e.target===modal){modal.remove();return;}
  const action=e.target.closest('[data-course-action]')?.dataset.courseAction;
  if(!action)return;
  if(action==='close'){modal.remove();return;}
  const lessons=lessonLibrary[activeCourseName]||[];
  if(action==='previous'&&activeLessonIndex>0){activeLessonIndex--;activeLessonSolved=false;renderCourseLesson();return;}
  if(action==='next'&&activeLessonIndex<lessons.length-1){activeLessonIndex++;activeLessonSolved=false;renderCourseLesson();return;}
  if(action==='check'){
   const selected=modal.querySelector('input[name="lessonAnswer"]:checked');
   const feedback=modal.querySelector('#lessonFeedback');
   if(!selected){feedback.textContent='Selecciona una respuesta para comprobarla.';feedback.className='panel-feedback incorrect';return;}
   const lesson=lessons[activeLessonIndex],correct=Number(selected.value)===lesson.correct;
   feedback.textContent=correct?'¡Respuesta correcta! '+lesson.why:'Todavía no. '+lesson.why;
   feedback.className='panel-feedback '+(correct?'correct':'incorrect');
   if(correct){activeLessonSolved=true;modal.querySelector('[data-course-action="complete"]').disabled=false;}
   return;
  }
  if(action==='complete'){
   if(!activeLessonSolved)return;
   const progress=getLearningProgress(),done=Array.isArray(progress[activeCourseName])?progress[activeCourseName]:[];
   if(!done.includes(activeLessonIndex))done.push(activeLessonIndex);
   progress[activeCourseName]=done;
   if(!saveLearningProgress(progress)){notify('No se pudo guardar el avance en este navegador.');return;}
   notify('Lección completada. Avance guardado.');
   if(activeLessonIndex<lessons.length-1){activeLessonIndex++;activeLessonSolved=false;renderCourseLesson();}
   else renderCourseLesson();
   return;
  }
  if(action==='practice'){
   const supported={JavaScript:'javascript',Python:'python',Java:'java',HTML:'html'};
   language.value=supported[activeCourseName];setExample();modal.remove();document.getElementById('laboratorio').scrollIntoView({behavior:'smooth'});
  }
 };
}
function renderCourseLesson(){
 const course=courses.find(item=>item.name===activeCourseName),lessons=lessonLibrary[activeCourseName]||[];
 const modal=document.getElementById('courseDialog'),progress=getLearningProgress();
 const completed=Array.isArray(progress[activeCourseName])?progress[activeCourseName]:[];
 if(!lessons.length){
  modal.innerHTML='<div class="course-dialog-card"><button class="panel-close" data-course-action="close" aria-label="Cerrar">×</button><span class="eyebrow">RUTA DE APRENDIZAJE</span><h2 id="courseDialogTitle">'+escapeText(course.name)+'</h2><p>'+escapeText(course.desc)+'</p><p class="course-coming">Las lecciones de esta tecnología todavía están en preparación. Las rutas disponibles ahora son JavaScript, Python, Java y HTML.</p></div>';
  return;
 }
 const lesson=lessons[activeLessonIndex],isDone=completed.includes(activeLessonIndex);
 const percent=Math.round(completed.length/lessons.length*100);
 modal.innerHTML='<div class="course-dialog-card lesson-dialog"><button class="panel-close" data-course-action="close" aria-label="Cerrar">×</button><span class="eyebrow">RUTA / '+escapeText(activeCourseName.toUpperCase())+'</span><h2 id="courseDialogTitle">'+escapeText(course.name)+'</h2><div class="lesson-progress"><div><span>'+completed.length+' de '+lessons.length+' lecciones completadas</span><b>'+percent+'%</b></div><div class="lesson-progress-track"><i style="width:'+percent+'%"></i></div></div><div class="lesson-step">LECCIÓN '+(activeLessonIndex+1)+' / '+lessons.length+'</div><h3 class="lesson-title">'+escapeText(lesson.title)+'</h3><p class="lesson-goal"><b>Objetivo:</b> '+escapeText(lesson.goal)+'</p><p class="lesson-explanation">'+escapeText(lesson.explanation)+'</p><pre class="lesson-code"><code>'+escapeText(lesson.code)+'</code></pre><div class="lesson-exercise"><b>COMPRUEBA LO APRENDIDO</b><p>'+escapeText(lesson.task)+'</p><div class="lesson-options">'+lesson.answers.map((answer,index)=>'<label><input type="radio" name="lessonAnswer" value="'+index+'"><span>'+escapeText(answer)+'</span></label>').join('')+'</div><button class="small-action" data-course-action="check">Comprobar respuesta ↗</button><p id="lessonFeedback" class="panel-feedback" aria-live="polite">'+(isDone?'Esta lección ya está completada. Puedes repasarla cuando quieras.':'Elige una respuesta y compruébala.')+'</p></div><div class="lesson-actions"><button class="lesson-secondary" data-course-action="previous" '+(activeLessonIndex===0?'disabled':'')+'>← Anterior</button><button class="lesson-complete" data-course-action="complete" '+((isDone||!activeLessonSolved)?'disabled':'')+'>'+(isDone?'Completada ✓':'Marcar como completada')+'</button><button class="lesson-secondary" data-course-action="next" '+(activeLessonIndex===lessons.length-1?'disabled':'')+'>Siguiente →</button></div><button class="lesson-practice" data-course-action="practice">Abrir ejemplo en el laboratorio ↗</button></div>';
}

const toast=document.getElementById('toast');let toastTimer;function notify(msg){toast.textContent=msg;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2200);}
document.getElementById('copyCode').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(editor.value);notify('Código copiado al portapapeles.');}catch{editor.select();notify('Selecciona y copia el código.');}});
const profileBtn=document.getElementById('profileBtn');
profileBtn.addEventListener('click',()=>{
 const total=getProjects().length;
 const profile=document.getElementById('profilePanel');
 if(profile){profile.remove();return;}
 const panel=document.createElement('section');
 panel.id='profilePanel';panel.className='profile-popover';
 panel.innerHTML='<div class="profile-popover-head"><strong>Perfil local</strong><button type="button" aria-label="Cerrar perfil">×</button></div><p>Tu actividad en este dispositivo.</p><div class="profile-stats"><span><b>16</b>Tecnologías</span><span><b>'+total+'</b>Proyectos guardados</span></div><small>No necesitas crear una cuenta. Los proyectos permanecen en este navegador.</small>';
 document.body.appendChild(panel);
 panel.querySelector('button').addEventListener('click',()=>panel.remove());
});
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
function renderProjects(){const projects=getProjects(),target=document.getElementById('savedProjects');document.getElementById('savedCount').textContent=projects.length+' guardados';if(!projects.length){target.innerHTML='<div class="empty-projects">Todavía no guardas proyectos. Crea una tarjeta en Creator Studio para comenzar.</div>';return;}target.innerHTML=projects.map((p,i)=>'<article class="saved-project"><h3>'+escapeText(p.title)+'</h3><p>'+escapeText(p.description)+'</p><small>'+escapeText(p.date)+'</small><button type="button" class="delete-project" data-delete-project="'+i+'">Eliminar</button></article>').join('');}
function escapeText(value){return String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
document.getElementById('savedProjects').addEventListener('click',e=>{const b=e.target.closest('[data-delete-project]');if(!b)return;const projects=getProjects();projects.splice(Number(b.dataset.deleteProject),1);try{localStorage.setItem(storageKey,JSON.stringify(projects));renderProjects();notify('Proyecto eliminado de este dispositivo.');}catch{notify('No se pudo actualizar el almacenamiento.');}});
document.getElementById('saveCreator').addEventListener('click',()=>{const projects=getProjects();if(projects.length>=30){notify('Has llegado al límite de 30 proyectos guardados en este navegador.');return;}projects.unshift({title:titleInput.value.trim()||'Proyecto sin título',description:descInput.value.trim()||'Sin descripción',date:new Date().toLocaleDateString('es-MX')});try{localStorage.setItem(storageKey,JSON.stringify(projects));renderProjects();notify('Proyecto guardado en este dispositivo.');}catch{notify('No se pudo guardar. Revisa el almacenamiento del navegador.');}});
renderProjects();
window.addEventListener('oknew:cloud-sync',()=>{renderProjects();});
