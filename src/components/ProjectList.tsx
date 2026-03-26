import { Project, InputMode } from '../types';
import { Download, Trash2, Folder, Calendar, Code } from 'lucide-react';
import { clsx } from 'clsx';

interface ProjectListProps {
  projects: Project[];
  deleteProject: (id: string) => void;
  theme: 'dark' | 'light';
  inputMode: InputMode;
}

export function ProjectList({ projects, deleteProject, theme, inputMode }: ProjectListProps) {
  const isDark = theme === 'dark';

  const handleDownload = (code: string, name: string) => {
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.toLowerCase().replace(/\s+/g, '-')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6">
      <div className="max-w-4xl w-full mx-auto space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tighter">Projects</h2>
          <p className="opacity-60">Your saved creations and AI-generated apps.</p>
        </div>

        {projects.length === 0 ? (
          <div className={clsx(
            "flex flex-col items-center justify-center p-12 rounded-3xl border border-dashed",
            isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
          )}>
            <Folder size={48} className="opacity-20 mb-4" />
            <p className="opacity-50">No projects yet. Start creating!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map(project => (
              <div key={project.id} className={clsx(
                "p-6 rounded-3xl border transition-all group",
                isDark ? "bg-[#111] border-white/10 hover:border-white/20" : "bg-white border-black/10 hover:border-black/20"
              )}>
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg">{project.name}</h3>
                    <div className="flex items-center gap-2 text-xs opacity-50">
                      <Calendar size={12} />
                      {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownload(project.code, project.name)}
                      className={clsx(
                        "p-2 rounded-xl bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all",
                        inputMode === 'touch' && "p-4"
                      )}
                    >
                      <Download size={18} />
                    </button>
                    <button
                      onClick={() => deleteProject(project.id)}
                      className={clsx(
                        "p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all",
                        inputMode === 'touch' && "p-4"
                      )}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className={clsx(
                  "p-4 rounded-xl font-mono text-xs overflow-hidden max-h-32 opacity-40",
                  isDark ? "bg-black" : "bg-gray-100"
                )}>
                  {project.code.slice(0, 200)}...
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
