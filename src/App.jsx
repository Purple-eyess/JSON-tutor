import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  ChevronRight, 
  Database, 
  Layers, 
  Braces, 
  Code2, 
  Award,
  RefreshCw,
  Sparkles,
  Bot,
  X,
  Loader2
} from 'lucide-react';

// --- DATA & CURRICULUM ---

const modules = [
  {
    id: 1,
    title: "Fundamentos de Sintaxis",
    icon: <Code2 size={20} />,
    description: "Todo en JSON es un par Clave: Valor. Aprende las reglas sagradas: comillas dobles y comas.",
    task: "Crea un objeto JSON simple que represente un 'lead' (cliente potencial). Debe tener: 'nombre' (string), 'edad' (number) y 'activo' (boolean).",
    initialCode: `{\n  \n}`,
    hints: [
      "Las claves siempre llevan comillas dobles: \"clave\"",
      "Los textos (strings) llevan comillas, los números NO.",
      "No pongas una coma al final de la última línea."
    ],
    validate: (json) => {
      if (typeof json !== 'object' || Array.isArray(json)) return "Debe ser un objeto simple { }, no una lista [ ].";
      if (!json.nombre || typeof json.nombre !== 'string') return "Falta la clave 'nombre' o no es texto.";
      if (!json.edad || typeof json.edad !== 'number') return "Falta la clave 'edad' o no es un número.";
      if (json.activo === undefined || typeof json.activo !== 'boolean') return "Falta la clave 'activo' o no es true/false.";
      return true;
    }
  },
  {
    id: 2,
    title: "Arrays: Listas de Datos",
    icon: <Layers size={20} />,
    description: "En automatización, casi siempre procesamos listas (varios pedidos, varios clientes). Usamos corchetes [ ] para esto.",
    task: "Crea una lista de correos electrónicos. Debe ser un Array que contenga al menos 3 strings de emails.",
    initialCode: `[\n  "usuario1@email.com"\n]`,
    hints: [
      "Usa corchetes [ ] para iniciar y cerrar.",
      "Separa cada email con una coma.",
      "Asegúrate de que sean al menos 3 emails."
    ],
    validate: (json) => {
      if (!Array.isArray(json)) return "El JSON debe comenzar con [ y terminar con ].";
      if (json.length < 3) return "Necesito al menos 3 emails en la lista.";
      if (!json.every(item => typeof item === 'string' && item.includes('@'))) return "Todos los elementos deben ser textos con formato de email.";
      return true;
    }
  },
  {
    id: 3,
    title: "Objetos Anidados (APIs)",
    icon: <Database size={20} />,
    description: "Las APIs reales envían datos dentro de datos. Esto se llama anidación.",
    task: "Crea un objeto 'pedido'. Debe tener un 'id' (numero) y un objeto 'cliente' dentro, que a su vez tenga 'email' (string).",
    initialCode: `{\n  "id": 101,\n  "cliente": {\n    \n  }\n}`,
    hints: [
      "Puedes poner un objeto { } dentro de otro objeto.",
      "Asegúrate de cerrar todas las llaves que abres."
    ],
    validate: (json) => {
      if (!json.cliente || typeof json.cliente !== 'object') return "Falta el objeto 'cliente' dentro del JSON.";
      if (!json.cliente.email) return "El objeto 'cliente' debe tener un campo 'email'.";
      return true;
    }
  },
  {
    id: 4,
    title: "El Estándar n8n",
    icon: <Terminal size={20} />,
    description: "CRÍTICO: n8n espera que sus datos viajen en una estructura específica: Array -> Objeto -> Clave 'json'.",
    task: "Reestructura estos datos para n8n. Crea un Array con 1 objeto. Ese objeto debe tener una propiedad 'json', y dentro de ella, tus datos.",
    initialCode: `[\n  {\n    "json": {\n      "lead": "Alex"\n    }\n  }\n]`,
    hints: [
      "Empieza con [ ].",
      "La clave principal OBLIGATORIA es \"json\".",
      "El valor de \"json\" es otro objeto con tus datos."
    ],
    validate: (json) => {
      if (!Array.isArray(json)) return "n8n siempre espera un Array [ ] en la raíz.";
      if (json.length === 0) return "El array está vacío.";
      if (!json[0].json) return "Falta la propiedad 'json' que envuelve los datos.";
      return true;
    }
  },
  {
    id: 5,
    title: "Desafío Final",
    icon: <Award size={20} />,
    description: "Corrige la sintaxis de este JSON que recibiste por Webhook.",
    task: "Corrige errores: comillas simples, comas extra o llaves abiertas.",
    initialCode: `{\n  "status": "success",\n  "data": ["item1", "item2"]\n}`,
    hints: [
      "Usa siempre comillas dobles.",
      "Revisa que el JSON sea válido según las normas aprendidas."
    ],
    validate: (json) => {
      if (json.status === "success") return true;
      return "Sigue intentando corregir la estructura.";
    }
  }
];

export default function App() {
  const [activeModuleId, setActiveModuleId] = useState(1);
  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState({ type: 'neutral', msg: 'Esperando input...' });
  const [parsedData, setParsedData] = useState(null);
  const [completedModules, setCompletedModules] = useState([]);
  
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState(null);

  // Gemini API Key assignment for the environment
  const apiKey = "";

  const activeModule = modules.find(m => m.id === activeModuleId);

  useEffect(() => {
    setCode(activeModule.initialCode);
    setFeedback({ type: 'neutral', msg: 'Escribe tu JSON para completar la misión.' });
    setParsedData(null);
    setAiExplanation(null);
  }, [activeModuleId]);

  const handleCodeChange = (e) => {
    setCode(e.target.value);
  };

  const generateJsonWithGemini = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `Genera SOLAMENTE código JSON válido para: ${aiPrompt}. No incluyas texto extra.` }] }]
          })
        }
      );
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        setCode(text.replace(/```json|```/g, '').trim());
        setIsAiModalOpen(false);
        setAiPrompt("");
      }
    } catch (error) {
      setFeedback({ type: 'error', msg: 'Error de conexión con la IA.' });
    }
    setIsAiLoading(false);
  };

  const explainCodeWithGemini = async () => {
    setIsAiLoading(true);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `Explica este JSON brevemente: \n${code}` }] }]
          })
        }
      );
      const data = await response.json();
      setAiExplanation(data.candidates?.[0]?.content?.parts?.[0]?.text);
    } catch (error) {
      setAiExplanation("Error al obtener explicación.");
    }
    setIsAiLoading(false);
  };

  const runValidation = () => {
    try {
      const json = JSON.parse(code);
      setParsedData(json);
      const result = activeModule.validate(json);
      if (result === true) {
        setFeedback({ type: 'success', msg: '¡Misión cumplida! Estructura válida.' });
        if (!completedModules.includes(activeModuleId)) setCompletedModules([...completedModules, activeModuleId]);
      } else {
        setFeedback({ type: 'error', msg: result });
      }
    } catch (err) {
      setParsedData(null);
      setFeedback({ type: 'error', msg: `Error: ${err.message}` });
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-4">
        <div className="flex items-center gap-2 text-emerald-400 mb-8 px-2 pt-2">
          <Braces size={28} />
          <h1 className="font-bold text-xl tracking-tight">JSON Pro</h1>
        </div>
        
        <div className="flex-1 space-y-2">
          {modules.map((mod) => (
            <button
              key={mod.id}
              onClick={() => setActiveModuleId(mod.id)}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${
                activeModuleId === mod.id ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              {completedModules.includes(mod.id) ? <CheckCircle size={16} className="text-emerald-500" /> : mod.icon}
              <span className="text-sm font-medium">{mod.title}</span>
            </button>
          ))}
        </div>

        <div className="p-4 bg-slate-800/50 rounded-xl text-center">
          <p className="text-xs text-slate-500 mb-1">Tu Progreso</p>
          <p className="text-2xl font-bold text-white">{Math.round((completedModules.length/modules.length)*100)}%</p>
        </div>
      </div>

      {/* Main Section */}
      <div className="flex-1 flex flex-col relative">
        {/* Modals & Overlays */}
        {isAiModalOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl">
              <div className="flex justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2"><Sparkles className="text-violet-400" /> Generar con IA</h3>
                <button onClick={() => setIsAiModalOpen(false)}><X size={20}/></button>
              </div>
              <textarea 
                className="w-full h-32 bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm mb-4 outline-none focus:border-violet-500 transition-all"
                placeholder="Ej: Lista de 5 contactos con nombre y teléfono..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
              <button 
                onClick={generateJsonWithGemini}
                disabled={isAiLoading}
                className="w-full py-3 bg-violet-600 hover:bg-violet-500 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isAiLoading ? <Loader2 className="animate-spin"/> : <Sparkles size={18}/>}
                Generar Código
              </button>
            </div>
          </div>
        )}

        {/* Content Header */}
        <div className="p-6 bg-slate-900/50 border-b border-slate-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">#{activeModule.id} {activeModule.title}</h2>
            <div className="flex gap-2">
              <button onClick={explainCodeWithGemini} className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-sm font-bold flex items-center gap-2 border border-indigo-500/20">
                <Bot size={16}/> Diagnóstico IA
              </button>
              <button onClick={() => setIsAiModalOpen(true)} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-all">
                <Sparkles size={16}/> Generar
              </button>
            </div>
          </div>
          <p className="text-slate-400 text-sm max-w-2xl">{activeModule.description}</p>
          <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700 flex items-center gap-3">
             <Terminal size={16} className="text-emerald-500"/>
             <span className="text-sm font-mono text-emerald-100">{activeModule.task}</span>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          <div className="flex-1 flex flex-col border-r border-slate-800">
            <textarea
              className="flex-1 bg-slate-950 p-6 font-mono text-sm outline-none resize-none text-emerald-400/90 leading-relaxed"
              value={code}
              onChange={handleCodeChange}
              spellCheck="false"
            />
            <div className="p-4 bg-slate-900 flex justify-between items-center border-t border-slate-800">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${feedback.type === 'success' ? 'bg-emerald-500 animate-pulse' : feedback.type === 'error' ? 'bg-rose-500' : 'bg-slate-600'}`}/>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{feedback.msg}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setCode(activeModule.initialCode)} className="p-2 text-slate-500 hover:text-white transition-colors">
                  <RefreshCw size={18}/>
                </button>
                <button onClick={runValidation} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/20">
                  <Play size={16}/> Validar
                </button>
              </div>
            </div>
          </div>

          {/* Result Panel */}
          <div className="lg:w-96 bg-slate-950 p-6 flex flex-col gap-6 overflow-y-auto">
            {aiExplanation && (
              <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
                <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">Explicación IA</h4>
                <p className="text-xs text-indigo-100/80 leading-relaxed italic">"{aiExplanation}"</p>
              </div>
            )}
            
            <div>
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Objeto de Salida (n8n Ready)</h4>
              <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 min-h-[150px]">
                {parsedData ? (
                  <pre className="text-xs text-emerald-300 font-mono">{JSON.stringify(parsedData, null, 2)}</pre>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-700 opacity-20 py-8">
                    <Database size={48} />
                    <p className="text-xs mt-2">Sin datos válidos</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-auto">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Tips del Instructor</h4>
              <div className="space-y-2">
                {activeModule.hints.map((h, i) => (
                  <div key={i} className="text-xs text-slate-400 flex gap-2">
                    <span className="text-emerald-500">▹</span> {h}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
