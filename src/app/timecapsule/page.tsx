"use client";

// Timecapsule ancestor AI avatar demo page
// This file contains the full interactive demo shown earlier.
// When you later break this into smaller components, feel free to refactor –
// for now a single file keeps things simple.

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, User, Bot, Volume2, VolumeX, Settings } from 'lucide-react';

// ---------------------- Mock AI response ------------------------------
const getAIResponse = async (
  message: string,
  ancestorContext: Partial<Ancestor> = {}
): Promise<string> => {
  await new Promise((r) => setTimeout(r, 1000 + Math.random() * 2000));
  const { name = 'your ancestor', timesPeriod = 'the past', location = 'Winterfell' } = ancestorContext;
  const responses = [
    `The North remembers. I am ${name} of House Stark, from ${timesPeriod}. What would you know of our ancestry?`,
    `In my time at ${location}, the words of House Stark were as true then as now: Winter is Coming. What do you wish to learn of our history?`,
    `The blood of the First Men runs strong in the Starks. Our family ruled as Kings of Winter for thousands of years before the dragons came.`,
    `Your question brings to mind the ancient days of ${timesPeriod}. The old gods were strong then, as they are now in the godswood.`,
    `As ${name}, I have seen the strength of House Stark tested many times. Our family endures, like the Wall that guards the realm.`,
    `In ${timesPeriod}, we Starks understood that the lone wolf dies, but the pack survives. Our family's bonds were our greatest strength.`
  ];
  return responses[Math.floor(Math.random() * responses.length)];
};

// ---------------------- Types ------------------------------
interface Ancestor {
  name: string;
  timesPeriod: string;
  location: string;
  relationship: string;
  occupation: string;
  imageUrl?: string;
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

// ---------------------- Rive-like Avatar ------------------------------
const RiveAvatar: React.FC<{ isTalking: boolean; ancestorData: Ancestor }> = ({ isTalking, ancestorData }) => {
  const [blinkState, setBlinkState] = useState(false);
  const [mouthState, setMouthState] = useState(0);

  // blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinkState(true);
      setTimeout(() => setBlinkState(false), 150);
    }, 2000 + Math.random() * 3000);
    return () => clearInterval(blinkInterval);
  }, []);

  // mouth movement when talking
  useEffect(() => {
    let mouthInt: NodeJS.Timeout | undefined;
    if (isTalking) {
      mouthInt = setInterval(() => setMouthState(Math.random() * 3), 100);
    } else {
      setMouthState(0);
    }
    return () => mouthInt && clearInterval(mouthInt);
  }, [isTalking]);

  const avatarStyle: React.CSSProperties = {
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    border: '4px solid #e2e8f0',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    transition: 'all 0.3s ease'
  };

  const eyeStyle: React.CSSProperties = {
    width: '20px',
    height: blinkState ? '2px' : '20px',
    backgroundColor: '#2d3748',
    borderRadius: '50%',
    margin: '0 15px',
    transition: 'height 0.1s ease'
  };

  const mouthStyle: React.CSSProperties = {
    width: '30px',
    height: `${5 + mouthState * 3}px`,
    backgroundColor: '#2d3748',
    borderRadius: '50%',
    marginTop: '20px',
    transition: 'height 0.1s ease'
  };

  return (
    <div style={avatarStyle} className={isTalking ? 'animate-pulse' : ''}>
      <div style={{ fontSize: 24, color: 'white', marginBottom: 20, fontWeight: 'bold' }}>
        {ancestorData.name || 'Ancestor'}
      </div>
      <div style={{ display: 'flex', marginBottom: 10 }}>
        <div style={eyeStyle} />
        <div style={eyeStyle} />
      </div>
      <div style={mouthStyle} />
      <div style={{ position: 'absolute', bottom: 10, fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
        {ancestorData.timesPeriod || 'Historical Era'}
      </div>
    </div>
  );
};

// ---------------------- Chat Window ------------------------------
const ChatWindow: React.FC<{ onTalking: (t: boolean) => void; ancestorData: Ancestor }> = ({ onTalking, ancestorData }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: `Hello! I am ${ancestorData.name || 'your ancestor'}. I'm here to share stories about our family history. What would you like to know?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { sender: 'user', text: input, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    onTalking(true);
    try {
      const reply = await getAIResponse(input, ancestorData);
      setMessages((prev) => [...prev, { sender: 'ai', text: reply, timestamp: new Date() }]);
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: "I'm having trouble responding right now. Please try again.", timestamp: new Date() }
      ]);
    } finally {
      setIsLoading(false);
      onTalking(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-96 bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center gap-2">
        <MessageCircle size={20} />
        <span className="font-semibold">Chat with {ancestorData.name || 'Ancestor'}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg flex items-start gap-2 ${
                m.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'
              }`}
            >
              {m.sender === 'ai' ? <Bot size={16} className="mt-1" /> : <User size={16} className="mt-1" />}
              <div>
                <p className="text-sm">{m.text}</p>
                <p className={`text-xs mt-1 ${m.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>{
                  m.timestamp.toLocaleTimeString()
                }</p>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2">
              <Bot size={16} />
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about family history..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------------------- Main Page ------------------------------
export default function TimecapsulePage() {
  const [talking, setTalking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const [selectedAncestor, setSelectedAncestor] = useState<Ancestor>({
    name: "Edwlye Stark",
    timesPeriod: 'Age of Heroes, Westeros',
    location: 'Winterfell, North',
    relationship: 'House Stark Ancestor',
    occupation: 'Lady of Winterfell',
    imageUrl: '/images/edwlye_stark.jpg'
  });

  const mockAncestors: Ancestor[] = [
    selectedAncestor,
    {
      name: 'Marna Locke',
      timesPeriod: 'Age of Heroes, Westeros',
      location: 'Castle Locke, North',
      relationship: 'House Stark Ally',
      occupation: 'Lady of House Locke',
      imageUrl: '/images/marna_locke.jpg'
    },
    {
      name: 'Rickard Starks',
      timesPeriod: 'Before Robert\'s Rebellion, Westeros',
      location: 'Winterfell, North',
      relationship: 'Lord of Winterfell',
      occupation: 'Warden of the North',
      imageUrl: '/images/rickard_starks.jpg'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">House Stark Legacy</h1>
          <p className="text-xl text-gray-600">Winter is Coming: Connect with Your Northern Ancestors</p>
        </div>

        {/* Ancestor Selection */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Settings size={24} /> Select Your Ancestor
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockAncestors.map((ancestor, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedAncestor(ancestor)}
                className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                  selectedAncestor.name === ancestor.name ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-semibold text-lg">{ancestor.name}</h3>
                <p className="text-sm text-gray-600">{ancestor.relationship}</p>
                <p className="text-sm text-gray-500">{ancestor.timesPeriod}</p>
                <p className="text-xs text-gray-400">{ancestor.occupation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Avatar Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-semibold mb-2">Avatar</h2>
              <div className="flex justify-center items-center gap-4 mb-4">
                <button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                    voiceEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  Voice {voiceEnabled ? 'On' : 'Off'}
                </button>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <RiveAvatar isTalking={talking} ancestorData={selectedAncestor} />
              {selectedAncestor.imageUrl && (
                <img
                  src={selectedAncestor.imageUrl}
                  alt={selectedAncestor.name}
                  className="w-40 h-40 object-cover rounded-lg mt-4 shadow"
                />
              )}
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-semibold">{selectedAncestor.name}</h3>
              <p className="text-sm text-gray-600">{selectedAncestor.relationship}</p>
              <div className="mt-2 text-xs text-gray-500">
                <p>📍 {selectedAncestor.location}</p>
                <p>💼 {selectedAncestor.occupation}</p>
              </div>
            </div>
          </div>

          {/* Chat Section */}
          <div>
            <ChatWindow onTalking={setTalking} ancestorData={selectedAncestor} />
          </div>
        </div>

        {/* Feature Info */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <div className="text-blue-600 text-3xl mb-2">🎭</div>
              <h3 className="font-semibold">Animated Avatars</h3>
              <p className="text-sm text-gray-600">Interactive ancestors with realistic expressions</p>
            </div>
            <div className="text-center p-4">
              <div className="text-blue-600 text-3xl mb-2">💬</div>
              <h3 className="font-semibold">AI Conversations</h3>
              <p className="text-sm text-gray-600">Chat with ancestors about family history</p>
            </div>
            <div className="text-center p-4">
              <div className="text-blue-600 text-3xl mb-2">🎵</div>
              <h3 className="font-semibold">Voice Integration</h3>
              <p className="text-sm text-gray-600">Hear your ancestors speak (Premium)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
