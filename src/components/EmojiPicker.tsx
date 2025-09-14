import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "./GlassCard";

interface EmojiPickerProps {
  open: boolean;
  onPick: (emoji: string) => void;
  onClose: () => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ open, onPick, onClose }) => {
  const emojis = [
    "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🙂", "😉", "😊", 
    "😍", "🥳", "🤔", "😎", "😭", "😡", "👍", "👎", "👏", "🙌",
    "🔥", "💯", "🎉", "⭐", "💜", "❤️", "💙", "💚", "🌟", "⚡",
    "🎯", "🎮", "🎵", "🎸", "🎬", "📺", "📱", "💻", "⌨️", "🖱️"
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute bottom-full mb-2 right-0 z-50"
          >
            <GlassCard className="p-3 w-64">
              <div className="grid grid-cols-8 gap-2">
                {emojis.map((emoji, index) => (
                  <motion.button
                    key={emoji}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      transition: { delay: index * 0.02 }
                    }}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      onPick(emoji);
                      onClose();
                    }}
                    className="text-xl hover:bg-muted rounded-lg p-1 transition-colors"
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};