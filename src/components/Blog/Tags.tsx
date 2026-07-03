"use client";

import React from "react";

type TagsProps = {
  tags: string[];
  activeTag?: string;
  onSelect?: (tag: string) => void;
};

const Tags = ({ tags, activeTag = "", onSelect }: TagsProps) => {
  if (!tags.length) {
    return null;
  }

  return (
    <div className="shadow-1 bg-white rounded-xl mt-7.5">
      <div className="px-4 sm:px-6 py-4.5 border-b border-gray-3">
        <h2 className="font-medium text-lg text-dark">Tags</h2>
      </div>

      <div className="p-4 sm:p-6">
        <div className="flex flex-wrap gap-3.5">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onSelect?.(activeTag === tag ? "" : tag)}
              className={`inline-flex border border-gray-3 py-2 px-4 rounded-md ease-out duration-200 hover:text-white hover:bg-blue hover:border-blue ${
                activeTag === tag ? "text-white bg-blue border-blue" : ""
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tags;
