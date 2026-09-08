import React from 'react';
import { Skeleton } from 'primereact/skeleton';
import TeamCard from '../cards/TeamCard.jsx';

const TeamGrid = ({ teams, loading }) => {
  const skeletonTemplate = () => (
    <div className="col-12 sm:col-6 lg:col-4 xl:col-3 p-2">
      <div className="border-1 surface-border surface-card border-round">
        <div className="flex flex-column align-items-center py-2">
          <Skeleton shape="box" size="10rem" className="mb-5" />
          <Skeleton width="60%" height="2rem" />
        </div>
        <div className="flex align-items-center justify-content-around p-3">
          <Skeleton width="2rem" height="2rem" className="mx-1" />
          <Skeleton width="2rem" height="2rem" className="mx-1" />
          <Skeleton width="2rem" height="2rem" className="mx-1" />
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
