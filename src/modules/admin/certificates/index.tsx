import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CertificateTemplates } from './CertificateTemplates';
import { CertificateEditor } from './CertificateEditor';
import { CertificateRules } from './CertificateRules';
import { CertificateRuleForm } from './CertificateRuleForm';

export const AdminCertificates: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<CertificateTemplates />} />
            <Route path="/new" element={<CertificateEditor />} />
            <Route path="/edit/:id" element={<CertificateEditor />} />
            <Route path="/rules" element={<CertificateRules />} />
            <Route path="/rules/new" element={<CertificateRuleForm />} />
        </Routes>
    );
};
