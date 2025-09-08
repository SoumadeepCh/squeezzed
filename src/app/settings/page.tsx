"use client";

import { AceternityCard } from "@/components/ui/aceternity-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MainLayout from "@/components/layout/main-layout";
import { motion } from "framer-motion";
import { Settings, User, Key, Bell, Palette, Info } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      // In a real app, this would be stored securely
      localStorage.setItem('openai-api-key', apiKey);
      toast.success("OpenAI API key saved successfully!");
      setApiKey("");
    }
  };

  const handleClearData = () => {
    localStorage.clear();
    toast.success("All data cleared successfully!");
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">
            Settings
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Configure your quiz experience and manage your account preferences.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* API Configuration */}
          <AceternityCard>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Key className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">OpenAI API Configuration</h3>
              </div>
              <p className="text-sm text-gray-600">
                Enter your OpenAI API key to enable quiz generation. Your key is stored locally and never sent to our servers.
              </p>
              <div className="space-y-2">
                <Label htmlFor="api-key">OpenAI API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
              <Button onClick={handleSaveApiKey} className="w-full">
                Save API Key
              </Button>
            </div>
          </AceternityCard>

          {/* App Information */}
          <AceternityCard>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Info className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold">About QuizMaster</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Version:</span> 1.0.0
                </div>
                <div>
                  <span className="font-medium">Built with:</span> Next.js 15, Tailwind CSS, OpenAI
                </div>
                <div>
                  <span className="font-medium">Features:</span>
                </div>
                <ul className="list-disc list-inside ml-4 space-y-1 text-gray-600">
                  <li>AI-powered question generation</li>
                  <li>Multiple question types (MCQ, Short, Long)</li>
                  <li>Real-time evaluation and scoring</li>
                  <li>Beautiful analytics and progress tracking</li>
                  <li>Responsive silver-blue themed design</li>
                </ul>
              </div>
            </div>
          </AceternityCard>

          {/* Data Management */}
          <AceternityCard>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-orange-600" />
                <h3 className="text-lg font-semibold">Data Management</h3>
              </div>
              <p className="text-sm text-gray-600">
                Manage your local data and quiz progress.
              </p>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  onClick={handleClearData}
                  className="w-full"
                >
                  Clear All Data
                </Button>
                <p className="text-xs text-gray-500">
                  This will remove all saved quiz progress, settings, and API keys from this browser.
                </p>
              </div>
            </div>
          </AceternityCard>

          {/* Theme Settings */}
          <AceternityCard>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Palette className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold">Theme & Appearance</h3>
              </div>
              <p className="text-sm text-gray-600">
                Customize the look and feel of your quiz experience.
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-silver-100 to-blue-100 rounded-lg">
                  <span className="text-sm">Current Theme</span>
                  <span className="text-sm font-medium">Silver Blue</span>
                </div>
                <p className="text-xs text-gray-500">
                  More themes coming soon! The current silver-blue theme provides optimal readability and focus for learning.
                </p>
              </div>
            </div>
          </AceternityCard>
        </div>

        {/* Instructions Card */}
        <AceternityCard>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <span>Getting Started</span>
            </h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Step 1:</strong> Get your OpenAI API key from <a href="https://platform.openai.com/api-keys" target="_blank" className="text-blue-600 hover:underline">OpenAI Platform</a></p>
              <p><strong>Step 2:</strong> Enter your API key in the configuration section above</p>
              <p><strong>Step 3:</strong> Go back to the home page and create your first quiz!</p>
              <p><strong>Note:</strong> Your API key is stored locally in your browser for security. You&apos;ll need to re-enter it if you clear your browser data.</p>
            </div>
          </div>
        </AceternityCard>
      </div>
    </MainLayout>
  );
}
