import React from 'react';
import { PromptTemplate } from '../templates';

interface TemplatesGalleryProps {
    onUseTemplate: (template: PromptTemplate) => void;
}

const TemplatesGallery = ({ onUseTemplate }: TemplatesGalleryProps) => {
    // For now, we'll just show a few placeholders as in the wireframe
    const templates = [
        { title: 'Temp 1', description: 'Template 1' },
        { title: 'Temp 2', description: 'Template 2' },
        { title: 'Temp 3', description: 'Template 3' },
    ];

    return (
        <div className="mt-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">Templates Gallery</h3>
            <div className="grid grid-cols-3 gap-4">
                {templates.map((template, index) => (
                    <div key={index} className="bg-muted p-4 rounded-lg text-center">
                        <p className="text-sm font-medium text-muted-foreground">{template.title}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TemplatesGallery;
