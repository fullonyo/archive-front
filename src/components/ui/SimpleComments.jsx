import React from 'react';
import { MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const SimpleComments = ({ profileUserId }) => {
  const { user } = useAuth();

  if (!profileUserId) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Perfil não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      {user && (
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="text-center py-8">
            <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Sistema de comentários em desenvolvimento...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      <div className="text-center py-12">
        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">
          {user ? 'Be the first to leave a comment!' : 'No comments yet.'}
        </p>
      </div>
    </div>
  );
};

export default SimpleComments;
