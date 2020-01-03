import React from 'react';
import { Container } from 'components/common';
import { SkillWrapper } from './styles';

export const Skill = ({ name, percentage, icon, color, level }) => (
  <SkillWrapper as={Container}>
    <div className="skill-progress">
      <div className="skill-title">
        <i className={icon} style={{ color }}></i>
        <span>{name}</span>
      </div>
      <div className="progress">
        <div
          className="progress-bar"
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin="0"
          aria-valuemax="100"
          style={{ width: `${percentage}%` }}
        >
          <span>{level}</span>
        </div>
      </div>
    </div>
  </SkillWrapper>
);
