import { ChatContainer } from '@/components/chat/chat-container';
import { Calendar, Clock, Users, Settings, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Modern Header with Actions */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Calendar Assistant
                </h1>
                <p className="text-sm text-gray-600">
                  AI-powered calendar management
                </p>
              </div>
            </div>
            
            {/* Quick Action Buttons */}
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <Clock className="w-4 h-4 mr-2" />
                Today
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <Users className="w-4 h-4 mr-2" />
                Meetings
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-4 h-[calc(100vh-80px)]">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
          
          {/* Sidebar with Quick Actions - Hidden on mobile, shown on desktop */}
          <div className="hidden lg:block lg:col-span-1 space-y-4">
            <Card className="p-4 bg-white/60 backdrop-blur-sm border-gray-200/50">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start text-sm h-8">
                  📅 View today's schedule
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm h-8">
                  ➕ Schedule new meeting
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm h-8">
                  🔍 Find free time
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm h-8">
                  📊 Productivity insights
                </Button>
              </div>
            </Card>

            <Card className="p-4 bg-white/60 backdrop-blur-sm border-gray-200/50">
              <h3 className="font-semibold text-gray-900 mb-3">Recent Activity</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Team sync scheduled</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Client call rescheduled</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Free time found</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Chat Interface - Takes most space */}
          <div className="lg:col-span-3 h-full">
            <Card className="h-full bg-white/70 backdrop-blur-sm border-gray-200/50 shadow-xl overflow-hidden">
              <ChatContainer />
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
