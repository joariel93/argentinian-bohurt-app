import React, { useState, useEffect } from 'react';
import InputVerification from '@/components/common/inputs/InputVerification';
import TournamentForm from '@/components/specifics/forms/TournamentForm';
import TournamentInfo from '@/components/specifics/infoViews/TournamentInfo';
import { useRouter } from 'next/router';
import apiService from '@/services/apiService';
import { Dialog } from 'primereact/dialog';
import { useToast } from '@/contexts/ToastContext';

const TournamentManagePage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [showOtpDialog, setShowOtpDialog] = useState(true);
  const [tournamentExists, setTournamentExists] = useState(false);
  const router = useRouter();
  const { tournamentId } = router.query;
  const { showError } = useToast();

  useEffect(() => {
    if (!tournamentId) {
      return;
    }
    if (tournamentId && isAuthenticated) {
      apiService.checkTournamentExists(tournamentId).then(exists => {
        setTournamentExists(exists);
      });
    }
  }, [tournamentId, isAuthenticated]);

  const handleOtpSubmit = async (inputOtp) => {
    const isValid = await apiService.validateOtp(tournamentId, inputOtp);

    if (isValid) {
      setIsAuthenticated(true);
      setOtp(inputOtp);
      setShowOtpDialog(false);
    } else {
      setOtpAttempts((prevAttempts) => prevAttempts + 1);
      if (otpAttempts >= 2) {
        showError('Has alcanzado el número máximo de intentos.', 'OTP bloqueado');
        setShowOtpDialog(false);
      } else {
        showError('Código incorrecto. Por favor, intenta nuevamente.', 'OTP inválido');
      }
    }
  };

  return (
    <div>
      <Dialog header="Autenticación OTP" visible={showOtpDialog} modal closable={false}>
        <InputVerification onSubmit={handleOtpSubmit} />
      </Dialog>

      {isAuthenticated && (
        tournamentExists ? (
          <TournamentInfo tournamentId={tournamentId} />
        ) : (
          <TournamentForm tournamentId={tournamentId} otp={otp} />
        )
      )}
    </div>
  );
};

export default TournamentManagePage;
