
import React, { useState, useCallback } from 'react';
import { generateForumDiscussion } from '../services/geminiService';
import type { ForumDiscussion } from '../types';
import { useLanguage } from '../context/LanguageContext';

const forumTopics = [
    'Managing Stress',
    'Healthy Eating Tips',
    'Beginner Fitness',
    'Improving Sleep Quality',
];

const UserIcon: React.FC<{ name: string }> = ({ name }) => {
    const initial = name.charAt(0).toUpperCase();
    const colors = ['bg-blue-200 text-blue-800', 'bg-green-200 text-green-800', 'bg-purple-200 text-purple-800', 'bg-yellow-200 text-yellow-800'];
    const color = colors[name.charCodeAt(0) % colors.length];

    return (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${color}`}>
            {initial}
        </div>
    );
};

const CommunityForum: React.FC = () => {
    const [discussion, setDiscussion] = useState<ForumDiscussion | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { language } = useLanguage();

    const fetchDiscussion = useCallback(async (topic: string) => {
        setIsLoading(true);
        setError(null);
        setDiscussion(null);
        try {
            const result = await generateForumDiscussion(topic, language);
            setDiscussion(result);
        } catch (err) {
            setError('Failed to generate AI discussion. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [language]);

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">AI-Generated Community Forum</h1>
            <p className="mt-1 text-base sm:text-lg text-slate-600">Explore simulated discussions on health topics.</p>

            <div className="mt-6 bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-700">Select a Topic</h2>
                <div className="flex flex-wrap gap-3 mt-4">
                    {forumTopics.map(topic => (
                        <button key={topic} onClick={() => fetchDiscussion(topic)} disabled={isLoading} className="px-4 py-2 bg-cyan-100 text-cyan-800 font-semibold rounded-lg hover:bg-cyan-200 disabled:opacity-50 transition-colors">
                            {topic}
                        </button>
                    ))}
                </div>
            </div>

            {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
            
            {isLoading && (
                <div className="text-center my-8">
                    <div className="w-10 h-10 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-3 text-slate-600">AI is generating the discussion...</p>
                </div>
            )}

            {discussion && (
                <div className="mt-8 bg-white p-6 rounded-xl shadow-md border border-slate-200 animate-fade-in">
                    <h2 className="text-2xl font-bold text-slate-800 border-b pb-3 mb-4">{discussion.topic}</h2>
                    <div className="space-y-6">
                        {discussion.posts.map((post, index) => (
                            <div key={index} className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    <UserIcon name={post.author} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800">{post.author} {post.isOP && <span className="text-xs font-medium bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-full ml-2">OP</span>}</p>
                                    <p className="mt-1 text-slate-700">{post.body}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunityForum;
