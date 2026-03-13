import React, { useState, useEffect } from 'react';
import {
    Star,
    MessageSquare,
    Send,
    CheckCircle2,
    ThumbsUp,
    Clock,
    ShieldCheck,
    UserCheck,
    Award,
    BadgeCheck,
    Heart,
    Loader2,
    AlertCircle
} from 'lucide-react';
import api from '../../utils/api';

const PRESET_SUGGESTIONS = [
    { id: 'fast', label: 'Fast Resolution', icon: Clock },
    { id: 'comm', label: 'Great Communication', icon: MessageSquare },
    { id: 'prof', label: 'Professional Behavior', icon: UserCheck },
    { id: 'tech', label: 'Technical Expertise', icon: ShieldCheck },
    { id: 'service', label: 'Excellent Service', icon: Award },
    { id: 'ontime', label: 'Resolved on Time', icon: BadgeCheck },
    { id: 'helpful', label: 'Very Helpful', icon: ThumbsUp }
];

const FeedbackModule = ({ ticketId, onSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comments, setComments] = useState('');
    const [selectedSuggestions, setSelectedSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [existingFeedback, setExistingFeedback] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                setFetching(true);
                const response = await api.get(`/tickets/${ticketId}/feedback`);
                if (response.data.success && response.data.data) {
                    setExistingFeedback(response.data.data);
                }
            } catch (err) {
                console.error('Error fetching feedback:', err);
            } finally {
                setFetching(false);
            }
        };

        if (ticketId) {
            fetchFeedback();
        }
    }, [ticketId]);

    const handleToggleSuggestion = (label) => {
        if (existingFeedback) return;
        setSelectedSuggestions(prev =>
            prev.includes(label)
                ? prev.filter(s => s !== label)
                : [...prev, label]
        );
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            setError('Please provide a star rating');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await api.post(`/tickets/${ticketId}/feedback`, {
                rating,
                comments: comments.trim() || null,
                suggestions: selectedSuggestions.length > 0 ? selectedSuggestions : null
            });

            if (response.data.success) {
                setExistingFeedback(response.data.data);
                if (onSubmitted) onSubmitted(response.data.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit feedback');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="bg-white p-12 rounded-[56px] border border-gray-100 shadow-xl shadow-gray-500/5 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Loading Experience Data...</p>
            </div>
        );
    }

    if (existingFeedback) {
        return (
            <div className="bg-white p-12 rounded-[56px] border border-gray-100 shadow-xl shadow-gray-500/5 space-y-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8">
                    <div className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full border border-emerald-100 flex items-center gap-2 animate-bounce-subtle">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Feedback Recorded</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-3xl font-black text-gray-900 tracking-tighter flex items-center gap-4">
                        <Heart className="w-10 h-10 text-rose-500" />
                        Service Satisfaction
                    </h3>
                    <p className="text-gray-400 font-medium max-w-md italic">Thank you for your valuable feedback. It helps us improve our support standards.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Quality Assessment</p>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`w-10 h-10 ${star <= existingFeedback.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-100'}`}
                                />
                            ))}
                        </div>
                    </div>

                    {existingFeedback.suggestions && existingFeedback.suggestions.length > 0 && (
                        <div className="space-y-6">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Service Highlights</p>
                            <div className="flex flex-wrap gap-3">
                                {existingFeedback.suggestions.map((sug) => {
                                    const preset = PRESET_SUGGESTIONS.find(p => p.label === sug);
                                    const Icon = preset?.icon || ThumbsUp;
                                    return (
                                        <div key={sug} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100 text-xs font-black">
                                            <Icon className="w-4 h-4" />
                                            {sug}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {existingFeedback.comments && (
                    <div className="pt-8 border-t border-gray-50">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-1">Detailed Remarks</p>
                        <div className="bg-gray-50/50 p-8 rounded-[32px] border border-gray-50 italic text-gray-600 font-medium leading-relaxed">
                            "{existingFeedback.comments}"
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white p-12 rounded-[56px] border border-gray-100 shadow-xl shadow-gray-500/5 space-y-12">
            <div className="space-y-4">
                <h3 className="text-3xl font-black text-gray-900 tracking-tighter flex items-center gap-4">
                    <Award className="w-10 h-10 text-indigo-600" />
                    How was your experience?
                </h3>
                <p className="text-gray-400 font-medium max-w-md">Your feedback is strictly confidential and used only to improve our resolution workflows.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <div className="space-y-10">
                    <div className="space-y-6">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Star Rating</label>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    onClick={() => setRating(star)}
                                    className="transition-transform active:scale-90"
                                >
                                    <Star
                                        className={`w-12 h-12 transition-all ${star <= (hoveredRating || rating)
                                            ? 'text-amber-400 fill-amber-400'
                                            : 'text-gray-100 group-hover:text-amber-100'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">What stood out?</label>
                        <div className="flex flex-wrap gap-3">
                            {PRESET_SUGGESTIONS.map((preset) => {
                                const isSelected = selectedSuggestions.includes(preset.label);
                                return (
                                    <button
                                        key={preset.id}
                                        onClick={() => handleToggleSuggestion(preset.label)}
                                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[11px] font-black transition-all border ${isSelected
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200 uppercase'
                                            : 'bg-white text-gray-400 border-gray-100 hover:border-indigo-200 hover:text-indigo-600'
                                            }`}
                                    >
                                        <preset.icon className={`w-4 h-4 ${isSelected ? 'animate-pulse' : ''}`} />
                                        {preset.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="space-y-6">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Additional Comments</label>
                        <textarea
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            placeholder="Tell us what we did well or where we can improve..."
                            className="w-full h-40 bg-gray-50 border-none rounded-[32px] p-8 text-gray-900 font-medium placeholder:text-gray-300 focus:ring-4 focus:ring-indigo-50 transition-all resize-none"
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-xs font-black animate-shake">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-[32px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-indigo-200 flex items-center justify-center gap-4 transition-all active:scale-[0.98]"
                    >
                        {loading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                Submit Experience Report
                                <Send className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeedbackModule;
