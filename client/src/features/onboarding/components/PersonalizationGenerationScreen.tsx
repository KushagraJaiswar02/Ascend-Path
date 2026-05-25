import React from 'react';
import { motion } from 'framer-motion';
import { Map, Sparkles, UsersRound, BriefcaseBusiness } from 'lucide-react';

const steps = [
  { icon: Sparkles, label: 'Building your personalized career space' },
  { icon: Map, label: 'Mapping your first realistic roadmap' },
  { icon: UsersRound, label: 'Looking for mentor guidance that fits you' },
  { icon: BriefcaseBusiness, label: 'Finding beginner-friendly opportunities' },
];

export const PersonalizationGenerationScreen: React.FC = () => {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary"
      >
        <Sparkles className="h-7 w-7" />
      </motion.div>
      <h2 className="text-3xl font-bold text-foreground">Building your starting point</h2>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
        AscendPath is turning your answers into a calm first dashboard, then deeper tools will unlock as your journey gains signal.
      </p>
      <div className="mt-8 grid w-full max-w-2xl gap-3 sm:grid-cols-2">
        {steps.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.12 }}
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 text-left"
          >
            <item.icon className="h-5 w-5 shrink-0 text-primary" />
            <span className="text-sm font-semibold text-foreground">{item.label}...</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
