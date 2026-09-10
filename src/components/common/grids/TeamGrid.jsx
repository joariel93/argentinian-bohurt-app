import React from 'react';
import { Skeleton } from 'primereact/skeleton';
import TeamCard from '../cards/TeamCard.jsx';

const TeamGrid = ({ teams, loading }) => {
  const skeletonTemplate = () => (
    <div className="col-12 sm:col-6 lg:col-4 xl:col-3 p-2">
      <div className="border-1 surface-border surface-card border-round">
        <div className="flex flex-column align-items-center py-2">
          <div style={{ width: '100%', maxWidth: '20rem', aspectRatio: '1', position: 'relative', margin: '0 auto' }}>
            <Skeleton width="100%" height="100%" />
          </div>
          <Skeleton width="70%" height="1.5rem" className="mt-2" />
        </div>
        <div className="flex align-items-center justify-content-around p-3">
          <Skeleton shape="circle" size="2rem" className="mx-1" />
          <Skeleton shape="circle" size="2rem" className="mx-1" />
          <Skeleton shape="circle" size="2rem" className="mx-1" />
        </div>
      </div>
    </div>
  );

  const itemTemplate = (team) => {
    if (loading) return skeletonTemplate();
    if (!team) return;
    return <TeamCard key={team.id} team={team} />;
  };

  return (
    <div className="grid grid-nogutter">
      {teams.map((team) => itemTemplate(team))}
    </div>
  );
};

export default TeamGrid;
