const configured = Boolean(window.SUPABASE_URL && window.SUPABASE_ANON_KEY && window.supabase);
const db = configured ? window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY) : null;
const $ = s => document.querySelector(s);
const loginBox=$("#loginBox"), dashboard=$("#dashboard");
function say(id,msg,error=false){const el=$(id);el.textContent=msg;el.style.color=error?"#b43232":"#28734f";}
function showDashboard(on){loginBox.classList.toggle("hidden",on);dashboard.classList.toggle("hidden",!on);}
if(!configured) say("#loginStatus","Configure primeiro as credenciais do Supabase no arquivo config.js.",true);
$("#loginForm").addEventListener("submit",async e=>{
 e.preventDefault(); if(!db){say("#loginStatus","O banco ainda não foi configurado.",true);return}
 say("#loginStatus","Verificando acesso…");
 const {error}=await db.auth.signInWithPassword({email:$("#email").value,password:$("#password").value});
 if(error){say("#loginStatus","Não foi possível entrar. Confira o e-mail e a senha.",true);return}
 const {data:{user}}=await db.auth.getUser();
 if(user?.app_metadata?.role!=="admin"){await db.auth.signOut();say("#loginStatus","Esta conta não tem permissão de administrador.",true);return}
 showDashboard(true);await loadFeedback();
});
$("#logout").addEventListener("click",async()=>{await db.auth.signOut();showDashboard(false)});
async function loadFeedback(){
 say("#dashStatus","Carregando avaliações…");
 const {data,error}=await db.from("school_feedback").select("id,rating,category,feedback,created_at").order("created_at",{ascending:false}).limit(500);
 if(error){say("#dashStatus","Não foi possível carregar. Confira as políticas do banco.",true);return}
 $("#total").textContent=data.length;
 $("#average").textContent=data.length?(data.reduce((n,x)=>n+x.rating,0)/data.length).toFixed(1).replace(".",",")+"/5":"—";
 const cutoff=Date.now()-30*24*60*60*1000;$("#recent").textContent=data.filter(x=>new Date(x.created_at).getTime()>cutoff).length;
 const list=$("#feedbackList");list.replaceChildren();
 if(!data.length){list.textContent="Ainda não há avaliações.";say("#dashStatus","Banco conectado. Nenhuma avaliação recebida.");return}
 data.forEach(item=>{
  const article=document.createElement("article");article.className="feedback-item";
  const meta=document.createElement("div");meta.className="feedback-meta";
  const stars=document.createElement("span");stars.className="feedback-stars";stars.textContent="★".repeat(item.rating)+"☆".repeat(5-item.rating);
  const category=document.createElement("span");category.textContent=item.category;
  const date=document.createElement("span");date.textContent=new Date(item.created_at).toLocaleString("pt-BR");
  meta.append(stars,category,date);
  const p=document.createElement("p");p.textContent=item.feedback;
  article.append(meta,p);list.append(article);
 });
 say("#dashStatus","Atualizado agora.");
}
(async()=>{if(db){const {data:{session}}=await db.auth.getSession();if(session){const {data:{user}}=await db.auth.getUser();if(user?.app_metadata?.role==="admin"){showDashboard(true);await loadFeedback()}else await db.auth.signOut()}}})();