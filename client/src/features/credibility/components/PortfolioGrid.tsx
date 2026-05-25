import React, { useState } from 'react';
import { ExternalLink, GitBranch, CheckCircle2, BookOpen, Code2, Briefcase, Edit, Trash2, Plus } from 'lucide-react';
import type { PortfolioProject } from '../api/credibility.api';
import { useDeletePortfolioProject } from '../hooks/useCredibility';
import { AddProjectModal } from './AddProjectModal';
import { useToast } from '@/components/ui/toast';

interface PortfolioGridProps {
  projects: PortfolioProject[];
  isOwner?: boolean;
}

export const PortfolioGrid: React.FC<PortfolioGridProps> = ({ projects, isOwner }) => {
  const { toast } = useToast();
  const deleteMutation = useDeletePortfolioProject();

  const [modalOpen, setModalOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<PortfolioProject | undefined>(undefined);

  const handleAddProject = () => {
    setActiveProject(undefined);
    setModalOpen(true);
  };

  const handleEditProject = (proj: PortfolioProject, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveProject(proj);
    setModalOpen(true);
  };

  const handleDeleteProject = async (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${title}" from your portfolio?`)) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: 'Project Deleted',
        description: `Successfully removed "${title}" from your portfolio.`,
      });
    } catch (err: any) {
      toast({
        title: 'Deletion Failed',
        description: err?.response?.data?.message || 'Could not delete project.',
        type: 'error',
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Owner Add CTA bar */}
      {isOwner && (
        <div className="flex justify-between items-center bg-muted/20 border border-border/40 p-4 rounded-2xl">
          <div>
            <h4 className="text-xs font-bold text-foreground">Manage Portfolio</h4>
            <p className="text-[10px] text-muted-foreground font-semibold">
              Showcase projects aligned with roadmaps to build outcome verification.
            </p>
          </div>
          <button
            onClick={handleAddProject}
            className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 bg-primary text-white hover:bg-primary/95 rounded-xl transition-all cursor-pointer shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Project</span>
          </button>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 border-2 border-dashed border-border/40 rounded-2xl bg-muted/20 text-center">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Briefcase className="h-7 w-7 text-primary/60" />
          </div>
          <p className="text-sm font-bold text-foreground mb-1">No Portfolio Projects Yet</p>
          <p className="text-xs text-muted-foreground max-w-xs mb-4">
            Add projects to showcase your growth and build career credibility.
          </p>
          {isOwner && (
            <button
              onClick={handleAddProject}
              className="text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              + Add your first project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {projects.map((project) => (
            <div
              key={project._id}
              className={`relative rounded-2xl border p-5 flex flex-col gap-3 transition-all hover:shadow-md hover:-translate-y-0.5 ${
                project.isMentorReviewed
                  ? 'border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 to-card'
                  : 'border-border bg-card'
              }`}
            >
              {/* Mentor Verified Badge */}
              {project.isMentorReviewed ? (
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-2 py-0.5">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Mentor Verified</span>
                </div>
              ) : (
                isOwner && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 select-none">
                    <button
                      onClick={(e) => handleEditProject(project, e)}
                      title="Edit project"
                      className="h-7 w-7 rounded-lg hover:bg-muted border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteProject(project._id, project.title, e)}
                      title="Delete project"
                      className="h-7 w-7 rounded-lg hover:bg-destructive/10 border border-border/40 flex items-center justify-center text-muted-foreground hover:text-destructive cursor-pointer transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )
              )}

              {/* Project Title */}
              <h3 className="text-sm font-bold text-foreground pr-24 leading-snug line-clamp-2">
                {project.title}
              </h3>

              {/* Description */}
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                {project.description}
              </p>

              {/* Technologies */}
              {project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {project.technologies.slice(0, 5).map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-primary/10 text-primary/80 rounded-md border border-primary/20"
                    >
                      <Code2 className="h-2.5 w-2.5" />
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 5 && (
                    <span className="text-[10px] text-muted-foreground px-2 py-0.5">
                      +{project.technologies.length - 5} more
                    </span>
                  )}
                </div>
              )}

              {/* Outcomes & Links */}
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/40">
                {/* Learning Outcomes */}
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <BookOpen className="h-3 w-3" />
                  <span>{project.learningOutcomes?.length || 0} outcomes</span>
                </div>

                {/* Action Links */}
                <div className="flex items-center gap-2">
                  {project.githubLink && (
                    <a
                      href={project.githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-7 w-7 rounded-lg bg-muted hover:bg-muted/80 border border-border/60 flex items-center justify-center transition-colors"
                    >
                      <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
                    </a>
                  )}
                  {project.demoLink && (
                    <a
                      href={project.demoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-7 w-7 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/30 flex items-center justify-center transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-primary" />
                    </a>
                  )}
                </div>
              </div>

              {/* Mentor Review Notes (if available) */}
              {project.mentorReviewNotes && (
                <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-3 mt-1">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Mentor's Note</p>
                  <p className="text-xs text-emerald-200/70 line-clamp-2">{project.mentorReviewNotes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Shared add/edit modal */}
      <AddProjectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        project={activeProject}
      />
    </div>
  );
};
