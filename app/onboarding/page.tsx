'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

type UserType = 'learner' | 'tutor' | 'both' | null;
type VerificationMethod = 'outlook' | 'student_id' | 'passport' | 'skip' | null;

const UNIVERSITIES = [
  { id: 'thi', name: 'Technische Hochschule Ingolstadt (THI)' },
  { id: 'other', name: 'Other University' },
];

const THI_PROGRAMS = [
  'Artificial Intelligence',
  'Automotive & Mobility Management',
  'Business Administration',
  'Computer Science',
  'Cyber Security',
  'Data Science',
  'Digital Business',
  'Electrical Engineering',
  'Flight and Vehicle Informatics',
  'Industrial Engineering',
  'International Management',
  'Management',
  'Mechanical Engineering',
  'Mechatronics',
  'User Experience Design',
  'Other',
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  
  // Form data
  const [userType, setUserType] = useState<UserType>(null);
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [university, setUniversity] = useState('thi');
  const [program, setProgram] = useState('');
  const [semester, setSemester] = useState('');
  const [verificationMethod, setVerificationMethod] = useState<VerificationMethod>(null);

  // Check if user is authenticated and needs onboarding
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/signin');
        return;
      }

      setUserId(user.id);
      setEmail(user.email || '');

      // Check if user already completed onboarding
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, onboarding_completed')
        .eq('id', user.id)
        .single();

      if (profile?.onboarding_completed) {
        router.push('/dashboard');
        return;
      }

      // Pre-fill name if available
      if (profile?.full_name) {
        setFullName(profile.full_name);
      }

      setLoading(false);
    };

    checkUser();
  }, [router]);

  const handleComplete = async () => {
    if (!userId) return;
    
    setSaving(true);
    try {
      // Determine role
      const role = userType === 'tutor' ? 'tutor' : 'learner';
      const isTutor = userType === 'tutor' || userType === 'both';
      
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      const profileData = {
        full_name: fullName,
        program: program,
        year: semester,
        role: role,
        is_tutor: isTutor,
        verified: verificationMethod === 'outlook' && email.endsWith('@thi.de'),
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      };

      if (existingProfile) {
        // Update existing profile
        await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', userId);
      } else {
        // Insert new profile
        await supabase
          .from('profiles')
          .insert({
            id: userId,
            ...profileData,
          });
      }

      router.push('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setSaving(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return userType !== null;
      case 2: return fullName.trim().length >= 2;
      case 3: return program !== '';
      case 4: return true; // Can skip verification
      default: return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--text-muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--text-muted)]">Step {step} of 4</span>
            <span className="text-sm text-[var(--text-muted)]">{Math.round((step / 4) * 100)}%</span>
          </div>
          <div className="h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[var(--primary)] transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: User Type */}
        {step === 1 && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-[var(--text)] mb-2">Welcome to Campus Help! 👋</h1>
              <p className="text-[var(--text-muted)]">What brings you here?</p>
            </div>

            <div className="grid gap-4">
              <button
                onClick={() => setUserType('learner')}
                className={`p-6 rounded-2xl border-2 text-left transition-all ${
                  userType === 'learner' 
                    ? 'border-[var(--primary)] bg-[var(--primary)]/5' 
                    : 'border-[var(--border)] hover:border-[var(--primary)]/50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl">📚</span>
                  <div>
                    <h3 className="font-semibold text-[var(--text)] mb-1">I want to learn</h3>
                    <p className="text-sm text-[var(--text-muted)]">Find tutors and get help with your courses</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setUserType('tutor')}
                className={`p-6 rounded-2xl border-2 text-left transition-all ${
                  userType === 'tutor' 
                    ? 'border-[var(--primary)] bg-[var(--primary)]/5' 
                    : 'border-[var(--border)] hover:border-[var(--primary)]/50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl">🎓</span>
                  <div>
                    <h3 className="font-semibold text-[var(--text)] mb-1">I want to tutor</h3>
                    <p className="text-sm text-[var(--text-muted)]">Help other students and earn money</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setUserType('both')}
                className={`p-6 rounded-2xl border-2 text-left transition-all ${
                  userType === 'both' 
                    ? 'border-[var(--primary)] bg-[var(--primary)]/5' 
                    : 'border-[var(--border)] hover:border-[var(--primary)]/50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl">🔄</span>
                  <div>
                    <h3 className="font-semibold text-[var(--text)] mb-1">Both</h3>
                    <p className="text-sm text-[var(--text-muted)]">Learn some subjects, tutor others</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Personal Info */}
        {step === 2 && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-[var(--text)] mb-2">Tell us about yourself</h1>
              <p className="text-[var(--text-muted)]">This will be shown on your profile</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g., Max Mustermann"
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  Age (optional)
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g., 22"
                  min="16"
                  max="100"
                  className="input w-full"
                />
              </div>

              <div className="p-4 rounded-xl bg-[var(--primary)]/5 border border-[var(--primary)]/20">
                <p className="text-sm text-[var(--text-muted)]">
                  <span className="font-medium text-[var(--text)]">Email:</span> {email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: University Info */}
        {step === 3 && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-[var(--text)] mb-2">Where do you study?</h1>
              <p className="text-[var(--text-muted)]">Select your university and program</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  University
                </label>
                <select
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="input w-full"
                >
                  {UNIVERSITIES.map((uni) => (
                    <option key={uni.id} value={uni.id}>{uni.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  Study Program *
                </label>
                <select
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Select your program</option>
                  {THI_PROGRAMS.map((prog) => (
                    <option key={prog} value={prog}>{prog}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  Semester
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Select your semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((sem) => (
                    <option key={sem} value={sem.toString()}>Semester {sem}</option>
                  ))}
                  <option value="graduate">Graduate/Alumni</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Verification */}
        {step === 4 && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-[var(--text)] mb-2">Verify your identity</h1>
              <p className="text-[var(--text-muted)]">Verified students get a badge and more trust</p>
            </div>

            <div className="grid gap-4">
              {email.endsWith('@thi.de') ? (
                <div className="p-6 rounded-2xl border-2 border-green-500 bg-green-500/5">
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">✅</span>
                    <div>
                      <h3 className="font-semibold text-[var(--text)] mb-1">Already Verified!</h3>
                      <p className="text-sm text-[var(--text-muted)]">
                        Your @thi.de email confirms you&apos;re a THI student
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setVerificationMethod('outlook')}
                    className={`p-6 rounded-2xl border-2 text-left transition-all ${
                      verificationMethod === 'outlook' 
                        ? 'border-[var(--primary)] bg-[var(--primary)]/5' 
                        : 'border-[var(--border)] hover:border-[var(--primary)]/50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">📧</span>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-[var(--text)]">THI Outlook Login</h3>
                          <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/10 text-green-600">Recommended</span>
                        </div>
                        <p className="text-sm text-[var(--text-muted)]">Sign in with your @thi.de email</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setVerificationMethod('student_id')}
                    className={`p-6 rounded-2xl border-2 text-left transition-all ${
                      verificationMethod === 'student_id' 
                        ? 'border-[var(--primary)] bg-[var(--primary)]/5' 
                        : 'border-[var(--border)] hover:border-[var(--primary)]/50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">🪪</span>
                      <div>
                        <h3 className="font-semibold text-[var(--text)] mb-1">Student ID</h3>
                        <p className="text-sm text-[var(--text-muted)]">Upload a photo of your student ID (manual review)</p>
                      </div>
                    </div>
                  </button>
                </>
              )}

              <button
                onClick={() => setVerificationMethod('skip')}
                className={`p-4 rounded-xl border text-center transition-all ${
                  verificationMethod === 'skip' 
                    ? 'border-[var(--primary)] bg-[var(--primary)]/5' 
                    : 'border-[var(--border)] hover:border-[var(--border)]'
                }`}
              >
                <p className="text-sm text-[var(--text-muted)]">Skip for now — verify later</p>
              </button>
            </div>

            {!email.endsWith('@thi.de') && (
              <p className="text-xs text-center text-[var(--text-muted)]">
                💡 Tip: Sign up with your @thi.de email for instant verification
              </p>
            )}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-12">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="btn-ghost"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="btn disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={saving}
              className="btn disabled:opacity-50"
            >
              {saving ? 'Setting up...' : 'Complete Setup ✓'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
