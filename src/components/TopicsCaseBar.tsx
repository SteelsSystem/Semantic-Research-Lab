import React, { useState, useRef, useEffect } from 'react';
import {
  Layers,
  Plus,
  ChevronDown,
  Search,
  Pin,
  PinOff,
  Download,
  Trash2,
  Edit2,
  Check,
  X,
  Sparkles,
  Compass,
  FolderOpen
} from 'lucide-react';
import { LanguageCode, ResearchCase } from '../types/cognitive';
import { TRANSLATIONS } from '../utils/i18n';
import { CaseManager } from '../utils/caseManager';

interface TopicsCaseBarProps {
  cases: ResearchCase[];
  activeCaseId: string;
  lang: LanguageCode;
  onSelectCase: (caseId: string) => void;
  onNewCase: (title: string) => void;
  onUpdateCases: (cases: ResearchCase[]) => void;
  onOpenEntryHub: () => void;
}

export function TopicsCaseBar({
  cases,
  activeCaseId,
  lang,
  onSelectCase,
  onNewCase,
  onUpdateCases,
  onOpenEntryHub,
}: TopicsCaseBarProps) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeCase = cases.find((c) => c.id === activeCaseId) || cases[0];

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTogglePin = (c: ResearchCase, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = CaseManager.updateCase(c.id, (prev) => ({
      ...prev,
      isPinned: !prev.isPinned,
    }));
    onUpdateCases(updated);
  };

  const handleDelete = (c: ResearchCase, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmMsg =
      lang === 'cs'
        ? `Opravdu chcete smazat případ "${c.title}"?`
        : `Are you sure you want to delete case "${c.title}"?`;
    if (confirm(confirmMsg)) {
      const updated = CaseManager.deleteCase(c.id);
      onUpdateCases(updated);
    }
  };

  const handleExport = (c: ResearchCase, e: React.MouseEvent) => {
    e.stopPropagation();
    CaseManager.exportCaseJson(c);
  };

  const handleStartRename = (c: ResearchCase, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTitleId(c.id);
    setEditTitleValue(c.title);
  };

  const handleSaveRename = (c: ResearchCase, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitleValue.trim()) {
      const updated = CaseManager.updateCase(c.id, (prev) => ({
        ...prev,
        title: editTitleValue.trim(),
      }));
      onUpdateCases(updated);
    }
    setEditingTitleId(null);
  };

  const handleQuickCreate = () => {
    const promptMsg =
      lang === 'cs'
        ? 'Zadejte název nového výzkumného případu / teze:'
        : 'Enter title for the new research case / thesis:';
    const defaultTitle = lang === 'cs' ? 'Nový případ' : 'New Research Case';
    const title = prompt(promptMsg, defaultTitle);
    if (title) {
      onNewCase(title);
    }
  };

  const filteredCases = cases.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.domainName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="w-full bg-[#080B12] border-b border-slate-800/80 px-4 py-1.5 flex items-center justify-between text-xs select-none">
      {/* Left: Active Case Switcher & Counter Badge */}
      <div className="flex items-center gap-3 relative" ref={dropdownRef}>
        {/* Cases Processed Badge */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-mono text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-semibold">{cases.length}</span>
          <span className="hidden sm:inline text-cyan-400/80">{t.topicsProcessedBadge}</span>
        </div>

        {/* Active Case Dropdown Trigger */}
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#0E131F] border border-slate-800 hover:border-cyan-500/50 transition-colors text-slate-200"
        >
          <FolderOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <div className="flex items-center gap-1.5 max-w-[220px] sm:max-w-[340px] truncate text-left">
            <span className="text-slate-400 text-[10px] font-mono uppercase hidden md:inline">
              {t.activeTopic}:
            </span>
            <span className="font-medium truncate text-cyan-200">
              {activeCase?.title || (lang === 'cs' ? 'Výzkumný případ' : 'Research Case')}
            </span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute top-full left-0 mt-1.5 w-80 sm:w-96 bg-[#090D16] border border-slate-800 rounded-lg shadow-2xl z-50 overflow-hidden flex flex-col max-h-[460px]">
            {/* Search & Actions Header */}
            <div className="p-2.5 border-b border-slate-800 bg-[#07090E] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{t.topicCasesHeading}</span>
                </span>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    handleQuickCreate();
                  }}
                  className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 text-[11px] font-mono flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>{t.newTopic}</span>
                </button>
              </div>

              <div className="relative">
                <Search className="w-3 h-3 text-slate-500 absolute left-2.5 top-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchTopics}
                  className="w-full bg-[#0B0E17] border border-slate-800 rounded pl-7 pr-2 py-1 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Cases List */}
            <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
              {filteredCases.length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-xs">{t.noTopicsFound}</div>
              ) : (
                filteredCases.map((c) => {
                  const isSelected = c.id === activeCaseId;
                  const isEditing = editingTitleId === c.id;

                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        onSelectCase(c.id);
                        setDropdownOpen(false);
                      }}
                      className={`group p-2 rounded border transition-all cursor-pointer flex flex-col gap-1 ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-100'
                          : 'bg-[#07090E]/60 border-slate-800/80 hover:border-slate-700 hover:bg-[#0B0E17] text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        {isEditing ? (
                          <div className="flex items-center gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={editTitleValue}
                              onChange={(e) => setEditTitleValue(e.target.value)}
                              className="flex-1 bg-slate-900 border border-cyan-500 rounded px-1.5 py-0.5 text-xs text-white"
                              autoFocus
                            />
                            <button
                              onClick={(e) => handleSaveRename(c, e)}
                              className="p-1 rounded hover:bg-slate-800 text-emerald-400"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingTitleId(null);
                              }}
                              className="p-1 rounded hover:bg-slate-800 text-slate-400"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 truncate flex-1">
                            {c.isPinned && <Pin className="w-2.5 h-2.5 text-amber-400 shrink-0" />}
                            <span className="font-medium text-xs truncate">{c.title}</span>
                          </div>
                        )}

                        {/* Row Quick Action Buttons */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={(e) => handleTogglePin(c, e)}
                            title={c.isPinned ? t.unpinTopic : t.pinTopic}
                            className="p-1 rounded text-slate-400 hover:text-amber-300"
                          >
                            {c.isPinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                          </button>
                          <button
                            onClick={(e) => handleStartRename(c, e)}
                            title={t.renameTopic}
                            className="p-1 rounded text-slate-400 hover:text-cyan-300"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => handleExport(c, e)}
                            title={t.exportTopic}
                            className="p-1 rounded text-slate-400 hover:text-emerald-300"
                          >
                            <Download className="w-3 h-3" />
                          </button>
                          {cases.length > 1 && (
                            <button
                              onClick={(e) => handleDelete(c, e)}
                              title={t.deleteTopic}
                              className="p-1 rounded text-slate-400 hover:text-rose-400"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span className="truncate max-w-[180px]">{c.domainName}</span>
                        <span>{c.transcripts.length} replik</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right: Quick Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleQuickCreate}
          className="px-2.5 py-1 rounded bg-[#0E131F] hover:bg-slate-800 border border-slate-800 text-cyan-300 hover:text-cyan-200 transition-colors flex items-center gap-1 font-mono text-[11px]"
        >
          <Plus className="w-3 h-3" />
          <span>{t.newTopic}</span>
        </button>

        <button
          onClick={onOpenEntryHub}
          className="px-2.5 py-1 rounded bg-gradient-to-r from-cyan-950 to-slate-900 border border-cyan-500/40 text-cyan-300 hover:border-cyan-400 transition-colors flex items-center gap-1 font-mono text-[11px]"
        >
          <Compass className="w-3 h-3" />
          <span>{t.entryHub}</span>
        </button>
      </div>
    </div>
  );
}
