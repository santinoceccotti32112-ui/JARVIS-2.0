export default async (request) => {
 if(request.method!=="POST") return Response.json({error:"Método no permitido."},{status:405});
 const key=process.env.OPENAI_API_KEY;
 if(!key) return Response.json({error:"No se encontró OPENAI_API_KEY en Netlify."},{status:500});
 let body; try{body=await request.json()}catch{return Response.json({error:"Solicitud inválida."},{status:400})}
 const messages=(Array.isArray(body.messages)?body.messages:[]).filter(m=>m&&["user","assistant"].includes(m.role)&&typeof m.content==="string").slice(-12).map(m=>({role:m.role,content:m.content.slice(0,4000)}));
 if(!messages.some(m=>m.role==="user")) return Response.json({error:"Escriba un mensaje."},{status:400});
 try{
  const r=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Authorization":`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({model:process.env.OPENAI_MODEL||"gpt-4.1-mini",instructions:"Eres JARVIS, asistente personal en español. Sé formal, preciso y educado. Dirígete al usuario como Señor. No afirmes controlar el teléfono ni otras aplicaciones si no tienes herramientas para hacerlo.",input:messages,max_output_tokens:700})});
  const data=await r.json();if(!r.ok)return Response.json({error:data?.error?.message||"OpenAI rechazó la solicitud."},{status:r.status});
  const reply=data.output_text||(data.output||[]).flatMap(x=>x.content||[]).filter(x=>x.type==="output_text").map(x=>x.text).join("\n");
  return Response.json({reply:reply||"No recibí respuesta de texto."});
 }catch{return Response.json({error:"No se pudo contactar con OpenAI."},{status:502})}
};