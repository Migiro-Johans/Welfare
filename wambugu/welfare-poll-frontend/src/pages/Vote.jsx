import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { voteAPI } from '../services/api';
import Navbar from '../components/Navbar';

const Vote = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState(null);
  const [currentVote, setCurrentVote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fetchingVote, setFetchingVote] = useState(true);

  useEffect(() => {
    fetchCurrentVote();
  }, []);

  const fetchCurrentVote = async () => {
    try {
      const response = await voteAPI.getMyVote();
      if (response.data.data) {
        setCurrentVote(response.data.data);
        setSelectedOption(response.data.data.vote_option);
      }
    } catch (err) {
      // No vote yet
    } finally {
      setFetchingVote(false);
    }
  };

  const handleVoteSubmit = async () => {
    if (!selectedOption) {
      setError('Please select an option');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await voteAPI.submitVote({ vote_option: selectedOption });
      setSuccess('Your vote has been recorded successfully!');
      setTimeout(() => {
        navigate('/results');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit vote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingVote) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Welfare Members Poll
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Choose your preferred welfare benefit option
          </p>
          {currentVote && (
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Your vote has been recorded - Thank you for participating!
            </div>
          )}
        </div>

        {error && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          </div>
        )}

        {success && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded relative">
              {success}
            </div>
          </div>
        )}

        <div className="mt-12 grid gap-8 lg:grid-cols-2 max-w-6xl mx-auto">
          {/* Option 1: Micro-Insurance Cover */}
          <div
            onClick={() => !currentVote && setSelectedOption(1)}
            className={`relative rounded-2xl border-2 p-8 shadow-lg transition-all duration-200 ${
              currentVote
                ? 'opacity-60 cursor-not-allowed'
                : 'cursor-pointer'
            } ${
              selectedOption === 1
                ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600'
                : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-xl'
            }`}
          >
            {selectedOption === 1 && (
              <div className="absolute top-4 right-4">
                <div className="rounded-full bg-indigo-600 p-1">
                  <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}

            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-600 text-white text-2xl font-bold">
                  1
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  Micro-Insurance Cover
                </h3>
                <p className="text-lg text-indigo-600 font-semibold">Britam</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-lg font-semibold text-gray-900">Annual Contribution</p>
                <p className="text-3xl font-bold text-indigo-600">Kshs. 7,300</p>
                <p className="text-sm text-gray-600">One-time yearly payment</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Benefits Include:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <span className="text-gray-700 font-medium">Inpatient Cover</span>
                      <span className="text-indigo-600 font-semibold ml-2">Kshs. 200,000</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <span className="text-gray-700 font-medium">Outpatient Cover</span>
                      <span className="text-indigo-600 font-semibold ml-2">Kshs. 50,000</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <span className="text-gray-700 font-medium">Last Expense</span>
                      <span className="text-indigo-600 font-semibold ml-2">Kshs. 40,000</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Option 2: Internal Welfare Contribution */}
          <div
            onClick={() => !currentVote && setSelectedOption(2)}
            className={`relative rounded-2xl border-2 p-8 shadow-lg transition-all duration-200 ${
              currentVote
                ? 'opacity-60 cursor-not-allowed'
                : 'cursor-pointer'
            } ${
              selectedOption === 2
                ? 'border-green-600 bg-green-50 ring-2 ring-green-600'
                : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-xl'
            }`}
          >
            {selectedOption === 2 && (
              <div className="absolute top-4 right-4">
                <div className="rounded-full bg-green-600 p-1">
                  <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}

            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-600 text-white text-2xl font-bold">
                  2
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  Internal Welfare
                </h3>
                <p className="text-lg text-green-600 font-semibold">Contribution Scheme</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-lg font-semibold text-gray-900">Monthly Contribution</p>
                <p className="text-3xl font-bold text-green-600">Kshs. 500</p>
                <p className="text-sm text-gray-600">Per month</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <svg className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-yellow-800">Important Requirement</p>
                    <p className="text-sm text-yellow-700">Minimum 150 members must choose this option for it to be implemented</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Benefits Include:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <span className="text-gray-700 font-medium">Hospital Bill Reimbursement</span>
                      <span className="text-green-600 font-semibold ml-2">Up to Kshs. 80,000</span>
                      <p className="text-sm text-gray-600 mt-1">For admissions over 10 days in Level 4 and above hospitals (with supporting bills)</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <span className="text-gray-700 font-medium">Last Expense Support to Next of Kin</span>
                      <span className="text-green-600 font-semibold ml-2">Up to Kshs. 50,000</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 max-w-4xl mx-auto text-center">
          {!currentVote && (
            <button
              onClick={handleVoteSubmit}
              disabled={loading || !selectedOption}
              className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Casting Vote...
                </>
              ) : (
                'Cast My Vote'
              )}
            </button>
          )}

          <div className="mt-6">
            <Link
              to="/results"
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              View Current Results →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vote;
