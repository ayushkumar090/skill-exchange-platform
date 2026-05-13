import React from 'react';

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Accepted: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
};

const RequestCard = ({ request, currentUserId, onAccept, onReject }) => {
  const { senderUserId, userSkillNeededId, message, status } = request;
  const skillOwner = userSkillNeededId?.userId;
  const isSkillOwner =
    skillOwner &&
    (typeof skillOwner === 'string' ? skillOwner : skillOwner?._id?.toString()) === currentUserId;

  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl shadow-md p-5 border border-white/60 hover:shadow-xl hover:-translate-y-0.5 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm text-gray-500">From</p>
          <p className="font-semibold text-gray-800">{senderUserId?.username || 'Unknown'}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-700'}`}>
          {status}
        </span>
      </div>
      <div className="mb-3">
        <p className="text-sm text-gray-500">Skill Requested</p>
        <p className="font-medium text-gray-700">{userSkillNeededId?.skillId?.skillName || 'Unknown Skill'}</p>
        <p className="text-xs text-gray-400">{userSkillNeededId?.skillId?.category}</p>
      </div>
      <div className="mb-3">
        <p className="text-sm text-gray-500">Message</p>
        <p className="text-gray-700 text-sm italic">"{message}"</p>
      </div>
      {status === 'Pending' && isSkillOwner && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onAccept(request._id)}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-1.5 px-4 rounded-lg text-sm font-semibold hover:from-green-400 hover:to-emerald-400 transition-all shadow-sm"
          >
            Accept
          </button>
          <button
            onClick={() => onReject(request._id)}
            className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 text-white py-1.5 px-4 rounded-lg text-sm font-semibold hover:from-red-400 hover:to-rose-400 transition-all shadow-sm"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
};

export default RequestCard;
