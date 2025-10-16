

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { CheckIcon } from '../../components/common/Icons';
import AuthLayout from '../../components/layout/AuthLayout';
import { Card } from '../../components/common/Card';
import { ROUTE_PATHS } from '../../constants/index';
import { Plan } from '../../types/index';

export const plansData: Plan[] = [
  { id: 'basic', name: 'Basic', price: '$29', priceSuffix: '/mes', features: ['Gestión de 5 módulos', 'Dashboard de vencimientos', 'Soporte por email'] },
  { id: 'standard', name: 'Standard', price: '$59', priceSuffix: '/mes', features: ['Gestión de 10 módulos', 'Alertas avanzadas', 'Soporte prioritario'], tag: 'Más Popular' },
  { id: 'premium', name: 'Premium', price: '$99', priceSuffix: '/mes', features: ['Módulos ilimitados', 'Reportes personalizados', 'Soporte 24/7 por teléfono'] },
];

const SubscriptionPage: React.FC = () => {
    const [selectedPlanId, setSelectedPlanId] = useState<string>(plansData[1].id);
    const [paymentForm, setPaymentForm] = useState({ cardNumber: '', expiryDate: '', cvv: '', nameOnCard: '' });
    const [paymentErrors, setPaymentErrors] = useState({ cardNumber: '', expiryDate: '', cvv: '', nameOnCard: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { completeSubscription } = useAuth();
    const navigate = useNavigate();

    const validatePaymentField = (name: string, value: string): string => {
        switch (name) {
            case 'cardNumber':
                return /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/.test(value) ? '' : 'Número de tarjeta inválido (16 dígitos).';
            case 'expiryDate': {
                if (!/^(0[1-9]|1[0-2])\s\/\s\d{2}$/.test(value)) {
                    return 'Formato MM / AA inválido.';
                }
                const [month, year] = value.split(' / ');
                const expiry = new Date(Number(`20${year}`), Number(month));
                const today = new Date();
                today.setMonth(today.getMonth() + 1);
                today.setDate(1); 
                if (expiry < today) {
                    return 'La tarjeta ha expirado.';
                }
                return '';
            }
            case 'cvv':
                return /^\d{3,4}$/.test(value) ? '' : 'CVV inválido (3-4 dígitos).';
            case 'nameOnCard':
                return /^[a-zA-Z\s.'-]+$/.test(value) ? '' : 'Solo se permiten letras y espacios.';
            default:
                return '';
        }
    };

    const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let { name, value } = e.target;
        let formattedValue = value;

        if (name === 'cardNumber') {
            formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').slice(0, 19);
        } else if (name === 'expiryDate') {
            formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(?=\d)/g, '$1 / ').slice(0, 7);
        } else if (name === 'cvv') {
            formattedValue = value.replace(/\D/g, '').slice(0, 4);
        } else if (name === 'nameOnCard') {
            formattedValue = value.replace(/[0-9]/g, '');
        }

        setPaymentForm({ ...paymentForm, [name]: formattedValue });
        
        const errorMsg = validatePaymentField(name, formattedValue);
        setPaymentErrors(prev => ({ ...prev, [name]: errorMsg }));
    };

    const isPaymentFormValid = () => {
        const isFreePlan = plansData.find(p => p.id === selectedPlanId)?.price === '$0';
        if (isFreePlan) return true;

        const allFieldsValid = Object.values(paymentErrors).every(err => err === '');
        const allRequiredFieldsFilled = paymentForm.cardNumber && paymentForm.expiryDate && paymentForm.cvv && paymentForm.nameOnCard;
        return allFieldsValid && !!allRequiredFieldsFilled;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const selectedPlan = plansData.find(p => p.id === selectedPlanId);
        if (!selectedPlan) {
            setError('Por favor, seleccione un plan.');
            return;
        }

        if (!isPaymentFormValid()) {
            setError('Por favor, complete todos los campos de pago correctamente.');
            const newErrors = Object.keys(paymentForm).reduce((acc, key) => {
                const fieldKey = key as keyof typeof paymentForm;
                const error = validatePaymentField(fieldKey, paymentForm[fieldKey]);
                if(error) acc[fieldKey] = error;
                return acc;
            }, {} as typeof paymentErrors);
            setPaymentErrors(prev => ({...prev, ...newErrors}));
            return;
        }

        setError('');
        setIsLoading(true);
        try {
            await completeSubscription(selectedPlanId, paymentForm);
        } catch (err: any) {
            setError((err as Error).message || 'Error al procesar la suscripción.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const wizardSteps = ['Cuenta', 'Empresa', 'Suscripción'];
    const selectedPlanDetails = plansData.find(p => p.id === selectedPlanId);
    const isFreePlan = selectedPlanDetails?.price === '$0';

    return (
        <AuthLayout variant="wizard" wizardSteps={wizardSteps} currentStep={3}>
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 text-center">Elija su Plan</h2>
                    <p className="text-gray-500 mt-1 text-sm text-center">Seleccione el plan que mejor se adapte a sus necesidades.</p>
                </div>
                
                <div className="grid sm:grid-cols-3 gap-6">
                    {plansData.map(plan => (
                        <div key={plan.id} className="relative">
                            {plan.tag && <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs font-semibold tracking-wide rounded-full bg-blue-600 text-white px-3 py-1 z-10">{plan.tag}</div>}
                            <Card
                                onClick={() => setSelectedPlanId(plan.id)}
                                className={`w-full h-full cursor-pointer transition-all ${selectedPlanId === plan.id ? 'border-blue-600 ring-2 ring-offset-2 ring-blue-600' : 'hover:border-gray-300 hover:shadow-md'}`}
                            >
                                <div className="flex flex-col items-start gap-4">
                                    <h3 className="text-xl font-bold">{plan.name}</h3>
                                    <p className="flex items-baseline gap-1">
                                        <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                                        <span className="font-medium text-gray-500">{plan.priceSuffix}</span>
                                    </p>
                                    <ul className="space-y-2 text-sm text-left w-full text-gray-600">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-center gap-2.5">
                                                <CheckIcon className="w-4 h-4 flex-shrink-0 text-green-500" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Card>
                        </div>
                    ))}
                </div>

                <div className="pt-8 border-t border-gray-200">
                     <h2 className="text-xl font-semibold text-gray-900 text-center mb-1">{isFreePlan ? 'Confirmación' : 'Método de Pago'}</h2>
                     <p className="text-sm text-gray-500 text-center">Complete los siguientes datos para finalizar.</p>
                     <form onSubmit={handleSubmit} className="space-y-4 mt-6 max-w-xl mx-auto">
                         {!isFreePlan && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <Input id="nameOnCard" label="Nombre en la Tarjeta" name="nameOnCard" type="text" placeholder="John M. Doe" value={paymentForm.nameOnCard} onChange={handlePaymentChange} required error={paymentErrors.nameOnCard} />
                                </div>
                                <div className="sm:col-span-2">
                                    <Input id="cardNumber" label="Número de Tarjeta" name="cardNumber" type="text" placeholder="**** **** **** 1234" value={paymentForm.cardNumber} onChange={handlePaymentChange} required error={paymentErrors.cardNumber} maxLength={19} />
                                </div>
                                <Input id="expiryDate" label="Fecha de Expiración" name="expiryDate" type="text" placeholder="MM / AA" value={paymentForm.expiryDate} onChange={handlePaymentChange} required error={paymentErrors.expiryDate} maxLength={7} />
                                <Input id="cvv" label="CVV" name="cvv" type="text" placeholder="123" value={paymentForm.cvv} onChange={handlePaymentChange} required error={paymentErrors.cvv} maxLength={4} />
                            </div>
                         )}
                        
                        {error && <p className="text-sm text-red-600 text-center py-2">{error}</p>}
                        <div className="pt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between sm:items-center">
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => navigate(ROUTE_PATHS.CREATE_COMPANY)}
                              disabled={isLoading}
                            >
                              Volver
                            </Button>
                            <Button type="submit" loading={isLoading} size="lg" className="w-full sm:w-auto" disabled={isLoading || !isPaymentFormValid()}>
                                {isFreePlan ? 'Comenzar' : `Pagar ${selectedPlanDetails?.price} y Activar`}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthLayout>
    );
};

export default SubscriptionPage;