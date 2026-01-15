import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Wand2,
  Expand,
  Minimize2,
  MessageSquare,
  CheckCircle,
  RefreshCw,
  FileText,
  Code,
  BookOpen,
  Lightbulb,
  ChevronRight,
  X,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

interface AISidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (content: string) => void;
  selectedText: string;
  onTransformText: (action: string, result: string) => void;
}

type AIAction = 'generate' | 'rewrite' | 'expand' | 'summarize' | 'grammar' | 'tone' | 'code';

const aiActions = [
  { id: 'rewrite', label: 'Rewrite', icon: RefreshCw, description: 'Rephrase the text' },
  { id: 'expand', label: 'Expand', icon: Expand, description: 'Add more detail' },
  { id: 'summarize', label: 'Summarize', icon: Minimize2, description: 'Make it shorter' },
  { id: 'grammar', label: 'Fix Grammar', icon: CheckCircle, description: 'Correct errors' },
  { id: 'tone', label: 'Change Tone', icon: MessageSquare, description: 'Adjust style' },
];

const documentTypes = [
  { value: 'blog', label: 'Blog Post', icon: BookOpen },
  { value: 'technical', label: 'Technical Doc', icon: Code },
  { value: 'resume', label: 'Resume', icon: FileText },
  { value: 'thesis', label: 'Academic/Thesis', icon: BookOpen },
  { value: 'general', label: 'General', icon: FileText },
];

const tones = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'formal', label: 'Formal' },
  { value: 'creative', label: 'Creative' },
  { value: 'technical', label: 'Technical' },
];

export const AISidebar = ({
  isOpen,
  onClose,
  onGenerate,
  selectedText,
  onTransformText,
}: AISidebarProps) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'transform'>('generate');
  const [topic, setTopic] = useState('');
  const [documentType, setDocumentType] = useState('blog');
  const [tone, setTone] = useState('professional');
  const [pages, setPages] = useState([2]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    setGeneratedPreview('');

    // Simulate AI generation with streaming effect
    const sampleContent = generateSampleDocument(topic, documentType, tone, pages[0]);
    
    for (let i = 0; i < sampleContent.length; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 20));
      setGeneratedPreview(sampleContent.slice(0, i + 10));
    }

    setIsGenerating(false);
  };

  const handleInsert = () => {
    onGenerate(generatedPreview);
    setGeneratedPreview('');
    setTopic('');
  };

  const handleTransform = async (action: AIAction) => {
    if (!selectedText) return;

    setIsGenerating(true);
    
    // Simulate AI transformation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const transformed = transformText(selectedText, action);
    onTransformText(action, transformed);
    
    setIsGenerating(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed right-0 top-0 h-full w-80 bg-background border-l border-border shadow-lg z-30 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg ai-gradient flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">AI Assistant</span>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab('generate')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'generate'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Wand2 className="w-4 h-4 inline-block mr-2" />
              Generate
            </button>
            <button
              onClick={() => setActiveTab('transform')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'transform'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Lightbulb className="w-4 h-4 inline-block mr-2" />
              Transform
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {activeTab === 'generate' ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="topic" className="text-sm font-medium">
                    Topic or Description
                  </Label>
                  <Textarea
                    id="topic"
                    placeholder="Describe what you want to write about..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="mt-1.5 min-h-[100px] resize-none"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Document Type</Label>
                  <Select value={documentType} onValueChange={setDocumentType}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="w-4 h-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tones.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">
                    Approximate Pages: {pages[0]}
                  </Label>
                  <Slider
                    value={pages}
                    onValueChange={setPages}
                    min={1}
                    max={10}
                    step={1}
                    className="mt-3"
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={!topic.trim() || isGenerating}
                  className="w-full ai-gradient text-white hover:opacity-90"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Document
                    </>
                  )}
                </Button>

                {generatedPreview && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4"
                  >
                    <Label className="text-sm font-medium">Preview</Label>
                    <div className="mt-1.5 p-3 bg-secondary rounded-lg text-sm max-h-[200px] overflow-y-auto custom-scrollbar">
                      <pre className="whitespace-pre-wrap font-serif text-xs leading-relaxed">
                        {generatedPreview.slice(0, 500)}
                        {generatedPreview.length > 500 && '...'}
                      </pre>
                    </div>
                    <Button
                      onClick={handleInsert}
                      className="w-full mt-2"
                      variant="outline"
                    >
                      <ChevronRight className="w-4 h-4 mr-2" />
                      Insert into Document
                    </Button>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {selectedText ? (
                  <>
                    <div className="p-3 bg-accent/50 rounded-lg">
                      <Label className="text-xs text-muted-foreground">Selected Text</Label>
                      <p className="mt-1 text-sm line-clamp-3">{selectedText}</p>
                    </div>

                    <div className="space-y-2">
                      {aiActions.map((action) => (
                        <Button
                          key={action.id}
                          variant="outline"
                          className="w-full justify-start h-auto py-3 bg-muted"
                          onClick={() => handleTransform(action.id as AIAction)}
                          disabled={isGenerating}
                        >
                          <action.icon className="w-4 h-4 mr-3 text-primary" />
                          <div className="text-left">
                            <div className="font-medium">{action.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {action.description}
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">
                      Select some text in your document to transform it with AI
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Helper functions for demo content generation
function generateSampleDocument(topic: string, type: string, tone: string, pages: number): string {
  const intro = `# ${topic}\n\n`;
  const sections = [];

  if (type === 'blog') {
    sections.push(
      `## Introduction

In today's rapidly evolving landscape, ${topic.toLowerCase()} has become increasingly important. This article explores the key aspects and provides actionable insights for readers looking to deepen their understanding.

`,
      `## Key Concepts

Understanding ${topic.toLowerCase()} requires familiarity with several fundamental concepts:

- **Core Principle 1**: Essential foundation for understanding
- **Core Principle 2**: Building upon the basics
- **Core Principle 3**: Advanced applications

`,
      `## Deep Dive

Let's explore each of these concepts in greater detail. The journey through ${topic.toLowerCase()} reveals fascinating insights that can transform how we approach related challenges.

`,
      `## Practical Applications

Now that we understand the theory, here are practical ways to apply this knowledge:

1. Start with small experiments
2. Document your findings
3. Iterate based on results
4. Share your learnings with others

`,
      `## Conclusion\n\n${topic} represents a significant opportunity for those willing to invest the time to understand it deeply. By following the principles outlined in this article, you'll be well-positioned for success.\n`
    );
  } else if (type === 'technical') {
    sections.push(
      `## Overview

This technical documentation covers ${topic.toLowerCase()}, including implementation details, best practices, and troubleshooting guidelines.

`,
      `## Prerequisites

- Requirement 1
- Requirement 2
- Requirement 3

`,
      `## Installation

\`\`\`bash
# Install the required dependencies
npm install ${topic.toLowerCase().replace(/\\s+/g, '-')}
\`\`\`

`,
      `## Configuration

\`\`\`javascript
const config = {
  setting1: 'value1',
  setting2: 'value2',
  enabled: true
};
\`\`\`

`,
      `## Usage

Detailed usage instructions and examples go here.

`,
      `## API Reference

| Method | Description | Parameters |
|--------|-------------|------------|
| init() | Initialize | config object |
| start() | Start process | none |
| stop() | Stop process | none |

`
    );
  } else {
    sections.push(
      `## Section 1

Content about ${topic.toLowerCase()} goes here. This section introduces the main ideas and sets the context for the reader.

`,
      `## Section 2

Further exploration of the topic with supporting details and examples.

`,
      `## Section 3\n\nConclusion and next steps for the reader to consider.\n`
    );
  }

  return intro + sections.slice(0, Math.min(pages + 2, sections.length)).join('');
}

function transformText(text: string, action: AIAction): string {
  switch (action) {
    case 'rewrite':
      return `[Rewritten] ${text.split(' ').reverse().join(' ')}`;
    case 'expand':
      return `${text}\n\nFurthermore, this concept extends into several related areas that deserve exploration. The implications are far-reaching and touch upon multiple disciplines.`;
    case 'summarize':
      return text.split(' ').slice(0, Math.ceil(text.split(' ').length / 2)).join(' ') + '...';
    case 'grammar':
      return text.charAt(0).toUpperCase() + text.slice(1).replace(/\s+/g, ' ').trim() + '.';
    case 'tone':
      return `[Tone adjusted] ${text}`;
    default:
      return text;
  }
}
