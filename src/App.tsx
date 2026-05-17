import { useState, useRef, ChangeEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Camera, 
  Upload, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Palette, 
  User, 
  Sun, 
  Moon, 
  CloudSun,
  Layout,
  Info
} from "lucide-react";

interface AnalysisResult {
  skinTone: {
    brightness: string;
    undertone: string;
    clarity: string;
    description: string;
  };
  impression: {
    value: string;
    chroma: string;
    contrast: string;
    vibe: string;
    description: string;
  };
  toneType: {
    type: string;
    description: string;
  };
  seasonalType: {
    main: string;
    sub: string;
    description: string;
  };
  colors: {
    best: string[];
    worst: string[];
  };
  disclaimer: string;
}

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeColor = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "분석에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#2D2D2D] font-sans">
      <main className="max-w-[1200px] mx-auto px-6 py-12 md:py-16">
        {/* Header Section */}
        <motion.header 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-between items-end mb-10"
        >
          <div className="flex flex-col">
            <span className="bento-label mb-1">AI-Powered Analysis</span>
            <h1 className="text-4xl font-serif italic text-[#1A1A1A]">Personal Color Consultant</h1>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium">Bento Visual Lab</p>
            <p className="text-xs text-[#8A847C]">{new Date().toLocaleDateString('ko-KR')}</p>
          </div>
        </motion.header>

        {/* Upload Section */}
        {!result && (
          <motion.section 
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-6"
          >
            <div className="md:col-span-12 bento-card p-12 text-center card-shadow">
              {!image ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="py-16 cursor-pointer group"
                >
                  <div className="w-20 h-20 bg-[#F0EFEC] rounded-full flex items-center justify-center mx-auto mb-8 group-hover:bg-[#E5E2DA] transition-all">
                    <Upload className="w-8 h-8 text-[#8A847C]" />
                  </div>
                  <h3 className="text-2xl font-serif italic mb-4">Upload Your Portrait</h3>
                  <p className="text-sm text-[#8A847C] mb-10 max-w-sm mx-auto leading-relaxed">
                    본인의 얼굴이 잘 나타난 정면 사진을 업로드해주세요.<br/>
                    자연광 아래의 노메이크업 사진이 가장 정확합니다.
                  </p>
                  <div className="inline-flex items-center gap-3 bg-[#1A1A1A] text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-black transition-colors">
                    <Camera className="w-4 h-4" />
                    Select Image
                  </div>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row items-center justify-center gap-12">
                  <div className="relative group max-w-xs aspect-[3/4] rounded-3xl overflow-hidden bg-[#F0EFEC] border border-[#E5E2DA] shadow-xl">
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={reset}
                      className="absolute top-4 right-4 bg-white/90 backdrop-blur p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                    >
                      <RefreshCw className="w-5 h-5 text-[#8A847C]" />
                    </button>
                  </div>
                  
                  <div className="flex flex-col items-start text-left max-w-xs">
                    <span className="bento-label mb-2">Selected Photo</span>
                    <h3 className="text-2xl font-serif italic mb-6">Ready for Analysis</h3>
                    <button
                      onClick={analyzeColor}
                      disabled={loading}
                      className="w-full bg-[#1A1A1A] text-white rounded-2xl py-4 font-semibold hover:bg-black disabled:bg-gray-300 transition-all flex items-center justify-center gap-3"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 text-amber-400" />
                          Start Analysis
                        </>
                      )}
                    </button>
                    <p className="mt-4 text-xs text-[#8A847C] italic">AI가 당신의 피부 톤과 이미지를 분석합니다.</p>
                  </div>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          </motion.section>
        )}

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm flex items-center gap-2 justify-center"
            >
              <XCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Bento Grid */}
        {result && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-min"
          >
            {/* Image Preview - span 4, row-span 4 */}
            <section className="col-span-1 md:col-span-4 row-span-4 bento-card aspect-[3/4] md:aspect-auto relative group">
              <img src={image!} className="w-full h-full object-cover" alt="Analyzed" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8 text-white">
                <p className="text-[10px] uppercase tracking-widest opacity-80 mb-1">Target Portrait</p>
                <p className="text-xl font-serif italic">Analyzed Subject</p>
              </div>
              <div className="absolute top-6 right-6 flex flex-col gap-2">
                <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white border border-white/30 uppercase">Face Scanned</div>
              </div>
            </section>

            {/* Primary Result - span 5, row-span 2 */}
            <section className="col-span-1 md:col-span-5 row-span-2 bento-card-dark p-8 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8A847C]">Primary Result</span>
                <span className="text-xs bg-[#2D2D2D] px-2 py-1 rounded text-[#E5E2DA]">Verified by AI</span>
              </div>
              <div className="flex flex-col">
                <h2 className="text-5xl font-serif italic mb-2 tracking-tight">
                  {result.seasonalType.main}
                </h2>
                <p className="text-[#8A847C] text-sm uppercase tracking-[0.1em] font-medium">
                  Subtype: {result.seasonalType.sub}
                </p>
              </div>
            </section>

            {/* Best Palette - span 3, row-span 4 */}
            <section className="col-span-1 md:col-span-3 row-span-4 bento-card p-6 flex flex-col">
              <h3 className="bento-label mb-6">Best Palette</h3>
              <div className="grid grid-cols-2 gap-3 flex-1">
                <div className="flex flex-col gap-3">
                  {result.colors.best.slice(0, 4).map((color, i) => (
                    <div 
                      key={i} 
                      className="aspect-square rounded-2xl card-shadow transition-transform hover:scale-105" 
                      style={{ backgroundColor: color.includes('#') ? color : getColorHex(color) }}
                      title={color}
                    />
                  ))}
                </div>
                <div className="flex flex-col gap-3 pt-10">
                  {result.colors.best.slice(4, 8).map((color, i) => (
                    <div 
                      key={i} 
                      className="aspect-square rounded-2xl card-shadow transition-transform hover:scale-105" 
                      style={{ backgroundColor: color.includes('#') ? color : getColorHex(color) }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-4 text-[10px] text-center text-[#8A847C] italic">Recommending vivid and harmonious tones</p>
            </section>

            {/* Skin & Impression - span 5, row-span 2 */}
            <section className="col-span-1 md:col-span-5 row-span-2 bento-card p-8 flex flex-col justify-between">
              <h3 className="bento-label mb-6">Skin & Impression</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] uppercase text-[#8A847C] mb-1">Skin Tone</p>
                    <p className="text-sm font-medium">{result.skinTone.undertone}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-[#8A847C] mb-1">Impression</p>
                    <p className="text-sm font-medium">{result.impression.vibe}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] uppercase text-[#8A847C] mb-1">Contrast</p>
                    <p className="text-sm font-medium">{result.impression.contrast}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-[#8A847C] mb-1">Clarity</p>
                    <p className="text-sm font-medium">{result.skinTone.clarity}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Avoid Colors - span 3, row-span 2 */}
            <section className="col-span-1 md:col-span-3 row-span-2 bento-card p-6 flex flex-col">
              <h3 className="bento-label mb-6">Avoid</h3>
              <div className="flex gap-2 flex-wrap justify-center mb-4">
                {result.colors.worst.map((color, i) => (
                  <div 
                    key={i} 
                    className="w-10 h-10 rounded-full shadow-inner border border-gray-100" 
                    style={{ backgroundColor: color.includes('#') ? color : getColorHex(color) }}
                    title={color}
                  />
                ))}
              </div>
              <p className="text-[11px] text-[#8A847C] text-center italic">피하면 좋은 색상들입니다.</p>
            </section>

            {/* Temperature & Description - span 6, row-span 2 */}
            <section className="col-span-1 md:col-span-6 row-span-2 bg-[#F0EFEC] rounded-3xl border border-[#E5E2DA] p-8 flex flex-col justify-center">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] uppercase tracking-wider font-bold">Temperature Analysis</span>
                <span className={`text-sm font-serif italic ${result.toneType.type.toLowerCase().includes('cool') ? 'text-blue-600' : 'text-amber-600'}`}>
                  {result.toneType.type}
                </span>
              </div>
              <div className="relative h-4 bg-gradient-to-r from-blue-300 via-gray-200 to-amber-300 rounded-full overflow-hidden mb-6">
                <motion.div 
                  initial={{ left: "50%" }}
                  animate={{ left: result.toneType.type.toLowerCase().includes('cool') ? "20%" : (result.toneType.type.toLowerCase().includes('warm') ? "80%" : "50%") }}
                  className="absolute top-0 w-1.5 h-full bg-[#1A1A1A] -translate-x-1/2"
                />
              </div>
              <p className="text-sm leading-relaxed text-[#4A4540]">
                {result.seasonalType.description}
              </p>
            </section>

            {/* Consultant Tip - span 3, row-span 2 */}
            <section className="col-span-1 md:col-span-3 row-span-2 bento-card p-8 flex items-center justify-center">
              <div className="text-center">
                <p className="bento-label mb-3">Consultant Tip</p>
                <p className="text-sm italic italic leading-relaxed text-gray-600">
                  "{result.skinTone.description}"
                </p>
              </div>
            </section>

            {/* Recovery Action */}
            <div className="col-span-1 md:col-span-12 flex justify-center py-10">
              <button 
                onClick={reset}
                className="flex items-center gap-2 px-10 py-4 rounded-full bg-[#1A1A1A] text-white hover:bg-black transition-all font-medium transition-all hover:scale-105"
              >
                <RefreshCw className="w-4 h-4" />
                Analyze New Portrait
              </button>
            </div>
          </motion.div>
        )}

        {/* Disclaimer Footer */}
        {result && (
          <footer className="mt-12 flex flex-col items-center gap-6">
            <div className="max-w-3xl text-center flex items-start gap-4 p-6 rounded-3xl bg-white border border-[#E5E2DA] text-[#8A847C] text-xs">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed italic">
                {result.disclaimer}
              </p>
            </div>
            <div className="flex justify-between w-full text-[10px] text-[#8A847C] uppercase tracking-[0.2em] px-4 font-bold">
              <span>Personalized System v2.5</span>
              <div className="flex gap-8">
                <span>Color Calibrated</span>
                <span>AI Verified</span>
              </div>
            </div>
          </footer>
        )}
      </main>
    </div>
  );
}

// Simple helper to get colors for display if hex isn't provided
function getColorHex(name: string): string {
  const map: Record<string, string> = {
    // Spring
    "코랄": "#FF7F50", "피치": "#FFDAB9", "민트": "#98FB98", "아이보리": "#FFFFF0",
    "라벤더": "#E6E6FA", "스카이블루": "#87CEEB", "레몬": "#FFFACD", "살구": "#FFB07C",
    "옐로우 그린": "#9ACD32", "웜 핑크": "#FF69B4",
    // Summer
    "스카이 블루": "#87CEEB", "파우더 블루": "#B0E0E6", "라벤더 퍼플": "#967BB6", "소프트 그레이": "#D3D3D3",
    "밀키 화이트": "#F8F8FF", "민트 그린": "#98FF98", "로즈": "#FF007F", "버건디": "#800020",
    "쿨 그레이": "#8E9299", "애쉬 블루": "#607D8B",
    // Autumn
    "머스타드": "#FFDB58", "테라코타": "#E2725B", "카키": "#BDB76B", "올리브": "#808000",
    "카멜": "#C19A6B", "브릭": "#CB4154", "베이지": "#F5F5DC", "모카": "#967969",
    "와인": "#722F37", "딥 브라운": "#3D2B1F",
    // Winter
    "로얄 블루": "#4169E1", "마룬": "#800000", "버건디 레드": "#800020", "차콜": "#36454F",
    "네이비": "#000080", "푸시아": "#FF00FF", "블랙": "#000000", "퓨어 화이트": "#FFFFFF",
    "일렉트릭 블루": "#7DF9FF", "진적색": "#B22222"
  };
  return map[name] || "#CCCCCC";
}
