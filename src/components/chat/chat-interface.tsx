import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useChatContext } from '../context/ChatContext';
import { useMessageContext } from '../context/MessageContext';
import { useUserContext } from '../context/UserContext';
import { SendUserMessageParams } from '../types';
import { getDisplayName } from '../utils';

export const useSendMessage = () => {
  const {
    client,
    config: { onSendMessage },
  } = useChatContext();
  const {
    actions: { addMessage },
  } = useMessageContext();
  const {
    state: { user },
  } = useUserContext();

  const [isSending, setIsSending] = useState(false);

  const sendMessage = useCallback(
    async (message: Omit<SendUserMessageParams, 'sessionId'>) => {
      setIsSending(true);
      const messageWithUser = {
        ...message,
        user: {
          ...user,
          name: getDisplayName(user),
        },
      };
      try {
        const response = await client.sendUserMessage(messageWithUser);
        addMessage(response.message);
        if (onSendMessage) {
          onSendMessage(response);
        }
      } catch (error) {
        // TODO: handle error
        console.error(error);
      } finally {
        setIsSending(false);
      }
    },
    [addMessage, client, onSendMessage, user]
  );

  return { isSending, sendMessage };
};