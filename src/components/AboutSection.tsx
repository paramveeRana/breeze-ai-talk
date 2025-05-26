
import React from 'react';
import { User } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <div className="p-4 border-t border-gray-200 bg-gray-50">
      <div className="flex items-start gap-3">
        <User size={20} className="text-blue-600 mt-1 flex-shrink-0" />
        <div className="text-xs text-gray-600 leading-relaxed">
          <p className="font-medium text-gray-800 mb-2">About the Developer</p>
          <p className="mb-2">
            Hello! I'm <span className="font-medium">Vidushi Gupta</span>, a final year BTech student at Medicaps University. 
            I'm passionate about creating intuitive and helpful applications that can make a positive impact on people's lives.
          </p>
          <p className="mb-2">
            My technical expertise lies in Flutter development, where I've built several cross-platform mobile applications. 
            I'm also familiar with web development technologies and enjoy exploring new frameworks and tools to expand my skill set.
          </p>
          <p>
            When I'm not coding, I enjoy reading about new technologies, participating in hackathons, and collaborating on 
            open-source projects. I believe in creating software that is accessible and beneficial for all users.
          </p>
        </div>
      </div>
    </div>
  );
};
