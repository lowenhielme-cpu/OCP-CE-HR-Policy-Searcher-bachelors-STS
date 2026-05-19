import React from 'react';
import ApiKeySettingsModal from './ApiKeySettingsModal';
import Chatbot from './Chatbot';

function AgentChatPanel({
    isSettingsOpen,
    onCloseSettings,
    wsRef,
    notice,
    onRunningChange,
}) {
    return (
        <div className="Agent-scanner" aria-label="Agent chat">
            <ApiKeySettingsModal
                open={isSettingsOpen}
                onClose={onCloseSettings}
            />

            <Chatbot
                wsRef={wsRef}
                notice={notice}
                onRunningChange={onRunningChange}
            />
        </div>
    );
}

export default AgentChatPanel;
