import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Bold, Italic, Underline, List, Link as LinkIcon,
  Image as ImageIcon, Calendar, Clock, Trash2, X, Loader2, Send, Sparkles
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Button from '../../components/Button';
import { supabase } from '../../lib/supabase';

// --- UTILS & CANVAS ---
interface PixelCrop { x: number; y: number; width: number; height: number; unit: 'px'; }

async function getCroppedImg(image: HTMLImageElement, crop: PixelCrop): Promise<File | null> {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(
    image,
    crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY,
    0, 0, 400, 400
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return;
      resolve(new File([blob], 'feed_image.jpg', { type: 'image/jpeg' }));
    }, 'image/jpeg', 0.95);
  });
}

// --- EDITOR COMPONENT ---
const VisualEditor = ({ content, onChange }: { content: string, onChange: (html: string) => void }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const execCmd = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      editorRef.current.focus();
    }
  };

  const addLink = () => {
    const url = prompt("Insira a URL:");
    if (url) execCmd('createLink', url);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-[300px]">
      <div className="flex items-center gap-0.5 p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex-wrap">
        <div className="flex gap-0.5 pr-2 border-r border-slate-200 dark:border-slate-700">
          <ToolbarBtn onClick={() => execCmd('bold')} title="Negrito"><Bold size={16} /></ToolbarBtn>
          <ToolbarBtn onClick={() => execCmd('italic')} title="Itálico"><Italic size={16} /></ToolbarBtn>
          <ToolbarBtn onClick={() => execCmd('underline')} title="Sublinhado"><Underline size={16} /></ToolbarBtn>
          <ToolbarBtn onClick={() => execCmd('strikeThrough')} title="Tachado"><span className="line-through text-xs font-bold">S</span></ToolbarBtn>
        </div>
        <div className="flex gap-0.5 px-2 border-r border-slate-200 dark:border-slate-700">
          <ToolbarBtn onClick={() => execCmd('insertUnorderedList')} title="Lista"><List size={16} /></ToolbarBtn>
        </div>
        <div className="flex gap-0.5 pl-2">
          <ToolbarBtn onClick={addLink} title="Link"><LinkIcon size={16} /></ToolbarBtn>
          <ToolbarBtn onClick={() => execCmd('removeFormat')} title="Limpar">
            <span className="text-xs font-serif italic">Tx</span>
          </ToolbarBtn>
        </div>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        className="flex-1 p-6 outline-none prose prose-sm max-w-none dark:prose-invert text-slate-800 dark:text-slate-200"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};

const ToolbarBtn = ({ onClick, children, title }: any) => (
  <button onClick={(e) => { e.preventDefault(); onClick(); }} title={title} className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-all">
    {children}
  </button>
);

// --- MAIN PAGE ---
export default function FeedPage() {
  const { appId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'create' | 'list' | 'scheduled'>('create');
  const [htmlContent, setHtmlContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = async () => {
      const minSide = Math.min(img.width, img.height);
      const crop: PixelCrop = { unit: 'px', width: minSide, height: minSide, x: (img.width - minSide) / 2, y: (img.height - minSide) / 2 };
      const cropped = await getCroppedImg(img, crop);
      if (cropped) {
        setImageFile(cropped);
        setImagePreview(URL.createObjectURL(cropped));
      }
    };
  };

  const handlePublish = async () => {
    if (!appId || (!htmlContent.replace(/<[^>]*>/g, '').trim() && !imageFile)) return;
    setPublishing(true);
    try {
      let imageUrl = null;
      if (imageFile) {
        const path = `${appId}/${Date.now()}.jpg`;
        await supabase.storage.from('feed-images').upload(path, imageFile);
        imageUrl = supabase.storage.from('feed-images').getPublicUrl(path).data.publicUrl;
      }

      const scheduledFor = isScheduled ? `${scheduleDate}T${scheduleTime}:00` : null;

      await supabase.from('feed_posts').insert([{
        app_id: appId,
        content: htmlContent,
        image_url: imageUrl,
        status: scheduledFor ? 'scheduled' : 'published',
        scheduled_for: scheduledFor
      }]);

      alert("Publicado!");
      setHtmlContent('');
      setImagePreview(null);
      setImageFile(null);
      setActiveTab(scheduledFor ? 'scheduled' : 'list');
    } catch (err) { console.error(err); } finally { setPublishing(false); }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <header className="flex justify-between items-center">
        <div>
          <button onClick={() => navigate(-1)} className="text-xs font-bold uppercase text-slate-400 mb-1 flex items-center gap-1"><ArrowLeft size={12} /> Voltar</button>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Gerenciar Feed</h1>
        </div>
      </header>

      <nav className="flex gap-4 border-b border-slate-200 dark:border-slate-800 pb-2">
        {['create', 'list', 'scheduled'].map((t: any) => (
          <button key={t} onClick={() => setActiveTab(t)} className={cn("text-xs font-black uppercase tracking-widest px-2 py-1 transition-all", activeTab === t ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-400")}>
            {t === 'create' ? 'Novo Post' : t === 'list' ? 'Publicados' : 'Agendados'}
          </button>
        ))}
      </nav>

      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up">
          <div className="lg:col-span-2 space-y-4">
            <VisualEditor content={htmlContent} onChange={setHtmlContent} />
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors">
                <ImageIcon size={18} /> {imagePreview ? 'Trocar Imagem' : 'Anexar Imagem (400x400)'}
              </button>
              <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleImageSelect} />
              {imagePreview && <img src={imagePreview} className="w-12 h-12 rounded-lg object-cover border border-slate-200" />}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-black uppercase text-slate-400">Agendamento</span>
                <button onClick={() => setIsScheduled(!isScheduled)} className={cn("w-10 h-5 rounded-full relative transition-all", isScheduled ? "bg-orange-500" : "bg-slate-200 dark:bg-slate-700")}>
                  <div className={cn("w-3 h-3 bg-white rounded-full absolute top-1 transition-all", isScheduled ? "left-6" : "left-1")} />
                </button>
              </div>
              {isScheduled && (
                <div className="space-y-3 mb-6 animate-fade-in">
                  <input type="date" className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700 text-sm" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} />
                  <input type="time" className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700 text-sm" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} />
                </div>
              )}
              <Button onClick={handlePublish} disabled={publishing} className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px]" leftIcon={publishing ? Loader2 : Send}>
                {publishing ? 'Salvando...' : isScheduled ? 'Agendar Post' : 'Publicar Agora'}
              </Button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}