import React from 'react';

const statusConfig = {
  Pending:  { cls: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',    dot: 'bg-amber-500' },
  Accepted: { cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300', dot: 'bg-emerald-500' },
  Rejected: { cls: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',        dot: 'bg-rose-500' },
};

const RequestCard = ({ request, currentUserId, onAccept, onReject }) => {
  const { senderUserId, userSkillNeededId, message, status } = request;
  const skillOwner = userSkillNeededId?.userId;
  const isSkillOwner =
    skillOwner &&
    (typeof skillOwner === 'string' ? skillOwner : skillOwner?._id?.toString()) === currentUserId;

  const conf = statusConfig[status] || { cls: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300', dot: 'bg-slate-400' };
  const initials = senderUserId?.username?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="card card-hover p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-sm flex-shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-none mb-0.5">From</p>
            <p className="font-semibold text-slate-900 dark:text-white text-sm">{senderUserId?.username || 'Unknown'}</p>
          </div>
        </div>
        <span className={`badge ${conf.cls}`}>
          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${conf.dot}`} aria-hidden="true"></span>
          {status}
        </span>
      </div>

      {/* Skill */}
      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg px-3 py-2">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Skill Requested</p>
        <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">{userSkillNeededId?.skillId?.skillName || 'Unknown Skill'}</p>
        {userSkillNeededId?.skillId?.category && (
          <p className="text-xs text-slate-400 dark:text-slate-500">{userSkillNeededId.skillId.category}</p>
        )}
      </div>

      {/* Message */}
      {message && (
        <p className="text-sm text-slate-600 dark:text-slate-400 italic">"{message}"</p>
      )}

      {/* Actions */}
      {status === 'Pending' && isSkillOwner && (
        <div className="flex gap-2 mt-1">
          <button
            onClick={() => onAccept(request._id)}
            className="btn-success flex-1 py-2"
          >
            Accept
          </button>
          <button
            onClick={() => onReject(request._id)}
            className="btn-danger flex-1 py-2"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
};

export default RequestCard;

