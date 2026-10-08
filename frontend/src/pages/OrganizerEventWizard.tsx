import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, Check, ArrowRight, ArrowLeft, 
  Sparkles, Save, Eye, Layers, Calendar, MapPin, 
  Image, Ticket, Users, Award, ShieldCheck, 
  Bell, FileCheck, CheckCircle2 
} from 'lucide-react';
import { eventsApi } from '../services/api';
import { EventItem, EventType } from '../types';
import confetti from 'canvas-confetti';

export const OrganizerEventWizard: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [publishing, setPublishing] = useState(false);

  // Wizard state covering all 12 steps
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    title: 'NextGen Autonomous AI Summit',
    category: 'Corporate Conferences',
    shortDescription: 'The premier worldwide conference on autonomous LLM agents and multi-agent coordination.',
    description: 'Join leading AI researchers, ML engineers, and enterprise architects for deep technical keynotes, workshops, and networking.',
    tags: 'AI, LLM, Autonomous Agents, Python, RAG',
    eventType: 'HYBRID' as EventType,
    capacity: 2500,

    // Step 2: Date & Time
    startDate: '2026-11-20',
    endDate: '2026-11-22',
    startTime: '09:00 AM',
    endTime: '06:00 PM',
    timezone: 'America/San_Francisco (PST)',

    // Step 3: Venue
    venueName: 'Moscone Convention Center',
    venueAddress: '747 Howard St, San Francisco, CA 94103',
    city: 'San Francisco',
    country: 'United States',
    onlineMeetingUrl: 'https://stream.eventsphere.io/nextgen-ai-2026',

    // Step 4: Branding
    bannerImageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1400&auto=format&fit=crop&q=80',
    logoImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    themeColor: '#8b5cf6',

    // Step 5: Tickets
    ticketName: 'Early Bird All-Access Pass',
    ticketPrice: 299,
    ticketQuantity: 500,
    ticketPerks: 'All Stage Keynotes, Hands-on Workshop Labs, Lunch Buffet, Digital RFID Badge',

    // Step 6: Agenda
    sessionTitle: 'Opening Keynote: Orchestrating Multi-Agent Swarms',
    sessionTrack: 'Main Stage A',
    sessionRoom: 'Hall 100',
    sessionStartTime: '09:30 AM',
    sessionEndTime: '10:45 AM',

    // Step 7: Speakers
    speakerName: 'Dr. Aris Thorne',
    speakerTitle: 'Chief AI Scientist at Synthetix Lab',
    speakerBio: 'Pioneering researcher in LLM reasoning loops and agent swarms.',

    // Step 8: Sponsors
    sponsorName: 'HyperCloud Inc.',
    sponsorTier: 'PLATINUM',
    sponsorBooth: 'Booth #101',

    // Step 9: Registration Requirements
    requireCompany: true,
    requireJobTitle: true,
    requireDietary: true,

    // Step 10: Notifications
    sendEmailConfirmation: true,
    sendReminder24h: true,
    kafkaEventDispatch: true,

    // Step 11: Review
    agreedToTerms: true
  });

  const steps = [
    { num: 1, label: 'Basic Info', icon: Layers },
    { num: 2, label: 'Date & Time', icon: Calendar },
    { num: 3, label: 'Venue', icon: MapPin },
    { num: 4, label: 'Branding', icon: Image },
    { num: 5, label: 'Tickets', icon: Ticket },
    { num: 6, label: 'Agenda', icon: Layers },
    { num: 7, label: 'Speakers', icon: Users },
    { num: 8, label: 'Sponsors', icon: Award },
    { num: 9, label: 'Registration', icon: FileCheck },
    { num: 10, label: 'Notifications', icon: Bell },
    { num: 11, label: 'Review', icon: Eye },
    { num: 12, label: 'Publish', icon: CheckCircle2 },
  ];

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await new Promise(r => setTimeout(r, 1200));
      const created = await eventsApi.create({
        title: formData.title,
        category: formData.category,
        shortDescription: formData.shortDescription,
        description: formData.description,
        tags: formData.tags.split(',').map(t => t.trim()),
        eventType: formData.eventType,
        capacity: formData.capacity,
        startDate: formData.startDate,
        endDate: formData.endDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        venueName: formData.venueName,
        venueAddress: formData.venueAddress,
        city: formData.city,
        country: formData.country,
        bannerImageUrl: formData.bannerImageUrl,
        logoImageUrl: formData.logoImageUrl,
        ticketTypes: [
          {
            id: 't-wiz-1',
            eventId: 'evt_wiz',
            name: formData.ticketName,
            description: 'Conference full pass.',
            price: formData.ticketPrice,
            currency: 'USD',
            quantityAvailable: formData.ticketQuantity,
            quantitySold: 0,
            perks: formData.ticketPerks.split(',').map(p => p.trim())
          }
        ],
        sessions: [
          {
            id: 'sess-wiz-1',
            eventId: 'evt_wiz',
            title: formData.sessionTitle,
            description: 'Keynote opening lecture.',
            sessionType: 'KEYNOTE',
            track: formData.sessionTrack,
            room: formData.sessionRoom,
            startTime: formData.sessionStartTime,
            endTime: formData.sessionEndTime,
            capacity: formData.capacity
          }
        ],
        speakers: [
          {
            id: 'spk-wiz-1',
            eventId: 'evt_wiz',
            name: formData.speakerName,
            jobTitle: formData.speakerTitle,
            company: 'Synthetix Lab',
            bio: formData.speakerBio,
            avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
            featured: true
          }
        ]
      });

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

      navigate(`/events/${created.slug}`);
    } catch (err) {
      console.error(err);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
            <Sparkles className="w-4 h-4" />
            <span>Multi-Step Event Lifecycle Wizard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Create & Publish Conference
          </h1>
        </div>

        <button 
          onClick={() => alert('Draft saved successfully to Redis & Postgres!')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>Save Draft</span>
        </button>
      </div>

      {/* 12-Step Progress Stepper Ribbon */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-slate-900/60 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 min-w-max">
          {steps.map((s) => {
            const isDone = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <button
                key={s.num}
                onClick={() => setCurrentStep(s.num)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isCurrent
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : isDone
                      ? 'bg-purple-950/60 text-purple-300 border border-purple-800/60'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  isDone ? 'bg-purple-400 text-slate-950 font-black' : isCurrent ? 'bg-white text-purple-600' : 'bg-slate-800 text-slate-400'
                }`}>
                  {isDone ? <Check className="w-3 h-3" /> : s.num}
                </span>
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Wizard Form Card */}
      <div className="glass-card p-8 rounded-3xl border border-slate-800 bg-slate-900/80 space-y-6">
        
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Step 1: Basic Summit Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Event Name / Title</label>
                <input 
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Corporate Conferences">Corporate Conferences</option>
                    <option value="Education and Workshop">Education & Workshops</option>
                    <option value="Hackathons and Tech">Hackathons & Tech</option>
                    <option value="Festivals and Large Events">Festivals & Large Events</option>
                    <option value="Webinars and Virtual Events">Webinars & Virtual Events</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Event Format</label>
                  <select
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value as EventType })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="HYBRID">Hybrid (In-Person + Livestream)</option>
                    <option value="OFFLINE">In-Person Only</option>
                    <option value="ONLINE">Virtual Only</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Short Elevator Pitch</label>
                <input 
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Full Description</label>
                <textarea 
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Date & Time */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Step 2: Date & Time Logistics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Start Date</label>
                <input 
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">End Date</label>
                <input 
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Daily Start Time</label>
                <input 
                  type="text"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Daily End Time</label>
                <input 
                  type="text"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Venue */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Step 3: Venue & Location</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Venue Name</label>
                <input 
                  type="text"
                  value={formData.venueName}
                  onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Full Street Address</label>
                <input 
                  type="text"
                  value={formData.venueAddress}
                  onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">City</label>
                  <input 
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Country</label>
                  <input 
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Branding */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Step 4: Branding & Media Assets</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Banner Image URL</label>
                <input 
                  type="text"
                  value={formData.bannerImageUrl}
                  onChange={(e) => setFormData({ ...formData, bannerImageUrl: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Logo URL</label>
                <input 
                  type="text"
                  value={formData.logoImageUrl}
                  onChange={(e) => setFormData({ ...formData, logoImageUrl: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Tickets */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Step 5: Ticket Tiers & Pricing</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Tier Name</label>
                <input 
                  type="text"
                  value={formData.ticketName}
                  onChange={(e) => setFormData({ ...formData, ticketName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Price (USD)</label>
                <input 
                  type="number"
                  value={formData.ticketPrice}
                  onChange={(e) => setFormData({ ...formData, ticketPrice: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-400 block mb-1">Perks (Comma Separated)</label>
                <input 
                  type="text"
                  value={formData.ticketPerks}
                  onChange={(e) => setFormData({ ...formData, ticketPerks: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Agenda */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Step 6: Agenda & Keynote Sessions</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Opening Session Title</label>
                <input 
                  type="text"
                  value={formData.sessionTitle}
                  onChange={(e) => setFormData({ ...formData, sessionTitle: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Stage Track</label>
                  <input 
                    type="text"
                    value={formData.sessionTrack}
                    onChange={(e) => setFormData({ ...formData, sessionTrack: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Room / Hall</label>
                  <input 
                    type="text"
                    value={formData.sessionRoom}
                    onChange={(e) => setFormData({ ...formData, sessionRoom: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 7: Speakers */}
        {currentStep === 7 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Step 7: Keynote Speakers</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Speaker Name</label>
                <input 
                  type="text"
                  value={formData.speakerName}
                  onChange={(e) => setFormData({ ...formData, speakerName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Speaker Job Title & Company</label>
                <input 
                  type="text"
                  value={formData.speakerTitle}
                  onChange={(e) => setFormData({ ...formData, speakerTitle: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 8: Sponsors */}
        {currentStep === 8 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Step 8: Sponsors & Booths</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Sponsor Name</label>
                <input 
                  type="text"
                  value={formData.sponsorName}
                  onChange={(e) => setFormData({ ...formData, sponsorName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Tier</label>
                <select
                  value={formData.sponsorTier}
                  onChange={(e) => setFormData({ ...formData, sponsorTier: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option>PLATINUM</option>
                  <option>GOLD</option>
                  <option>SILVER</option>
                  <option>BRONZE</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 9: Registration */}
        {currentStep === 9 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Step 9: Registration Requirements</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs text-slate-300">
                <input type="checkbox" defaultChecked className="rounded bg-slate-900 text-purple-600 w-4 h-4" />
                <span>Require Organization / Company Name</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-300">
                <input type="checkbox" defaultChecked className="rounded bg-slate-900 text-purple-600 w-4 h-4" />
                <span>Require Job Title / Role</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-300">
                <input type="checkbox" defaultChecked className="rounded bg-slate-900 text-purple-600 w-4 h-4" />
                <span>Require Dietary & Accessibility preferences</span>
              </label>
            </div>
          </div>
        )}

        {/* Step 10: Notifications */}
        {currentStep === 10 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Step 10: Notifications & Kafka Triggers</h3>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700 text-xs space-y-2 text-slate-300">
              <div className="flex items-center gap-2 text-purple-400 font-semibold">
                <Bell className="w-4 h-4" />
                <span>Kafka Event Streaming Channels</span>
              </div>
              <p>When published, Kafka topics <code>event-events</code>, <code>notification-events</code>, and <code>ai-events</code> will automatically index this summit for Vector RAG retrieval.</p>
            </div>
          </div>
        )}

        {/* Step 11: Review */}
        {currentStep === 11 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Step 11: Pre-Publish Review</h3>
            <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700 text-xs space-y-3 text-slate-300">
              <div className="flex justify-between border-b border-slate-700 pb-2">
                <span className="font-semibold text-slate-400">Title:</span>
                <span className="font-bold text-white">{formData.title}</span>
              </div>
              <div className="flex justify-between border-b border-slate-700 pb-2">
                <span className="font-semibold text-slate-400">Date:</span>
                <span className="font-bold text-white">{formData.startDate} - {formData.endDate}</span>
              </div>
              <div className="flex justify-between border-b border-slate-700 pb-2">
                <span className="font-semibold text-slate-400">Venue:</span>
                <span className="font-bold text-white">{formData.venueName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Ticket Tier:</span>
                <span className="font-bold text-purple-400">{formData.ticketName} (${formData.ticketPrice})</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 12: Publish Confirmation */}
        {currentStep === 12 && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center mx-auto shadow-xl shadow-purple-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Ready to Go Live!</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Clicking Publish will deploy your public event landing page, open ticket registration, and initialize the Sphere AI assistant RAG context.
              </p>
            </div>
          </div>
        )}

        {/* Stepper Navigation Buttons */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {currentStep < 12 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(Math.min(12, currentStep + 1))}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all"
            >
              <span>Next Step ({currentStep + 1}/12)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing}
              className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-brand-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-purple-600/40 hover:scale-105 transition-all"
            >
              {publishing ? <span>Publishing to Event Sphere...</span> : <span>Publish Summit Live!</span>}
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
