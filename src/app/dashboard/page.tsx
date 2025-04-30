import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { SendUserMessageParams } from '../types';
import { sendUserMessage } from '../actions';

export const useSendMessage = () => {
    const dispatch = useDispatch();

    return useCallback((params: SendUserMessageParams) => {
        dispatch(sendUserMessage(params));
    }, [dispatch]);
};