

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { CheckIcon } from '../../components/common/Icons';
import AuthLayout from '../../components/layout/AuthLayout';
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
            const newErrors: Partial<typeof paymentErrors> = {};
            for (const key of Object.keys(paymentForm)) {
                const fieldKey = key as keyof typeof paymentForm;
                const error = validatePaymentField(key, paymentForm[fieldKey]);
                if (error) newErrors[fieldKey] = error;
            }
            setPaymentErrors(prev => ({...prev, ...newErrors}));
            return;
        }

        setError('');
        setIsLoading(true);
        try {
            await completeSubscription(selectedPlanId, paymentForm);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Error al procesar la suscripción.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const wizardSteps = ['Cuenta', 'Empresa', 'Suscripción'];
    const selectedPlanDetails = plansData.find(p => p.id === selectedPlanId);
    const isFreePlan = selectedPlanDetails?.price === '$0';

    return (
        <AuthLayout variant="wizard" wizardSteps={wizardSteps} currentStep={3}>
            <div className="flex flex-col h-full max-h-[calc(100vh-200px)]">
                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Elija su Plan</h2>
                    <p className="text-slate-500 mt-1 text-sm">Seleccione el plan que mejor se adapte a sus necesidades.</p>
                </div>

                {/* Main Content - Two Column Layout */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-0">
                    {/* Plans Column - Takes 3/5 */}
                    <div className="lg:col-span-3 flex flex-col gap-3">
                        {plansData.map(plan => (
                            <div
                                key={plan.id}
                                onClick={() => setSelectedPlanId(plan.id)}
                                className={`relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all bg-white ${
                                    selectedPlanId === plan.id
                                        ? 'border-slate-900 ring-1 ring-slate-900'
                                        : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                                }`}
                            >
                                {/* Radio indicator */}
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                    selectedPlanId === plan.id ? 'border-slate-900 bg-slate-900' : 'border-slate-300'
                                }`}>
                                    {selectedPlanId === plan.id && (
                                        <div className="w-2 h-2 rounded-full bg-white" />
                                    )}
                                </div>

                                {/* Plan info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-slate-900">{plan.name}</h3>
                                        {plan.tag && (
                                            <span className="text-[10px] font-semibold tracking-wide rounded-full bg-slate-900 text-white px-2 py-0.5">
                                                {plan.tag}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                                        {plan.features.map((feature, index) => (
                                            <span key={index} className="text-xs text-slate-500 flex items-center gap-1">
                                                <CheckIcon className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                                                {feature}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="text-right flex-shrink-0">
                                    <span className="text-2xl font-bold text-slate-900">{plan.price}</span>
                                    <span className="text-sm text-slate-500">{plan.priceSuffix}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Payment Column - Takes 2/5 */}
                    <div className="lg:col-span-2 flex flex-col">
                        <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 flex-1 flex flex-col">
                            <h3 className="text-sm font-semibold text-slate-900 mb-4">
                                {isFreePlan ? 'Confirmación' : 'Método de Pago'}
                            </h3>

                            <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                                {!isFreePlan && (
                                    <div className="space-y-3 flex-1">
                                        <Input
                                            id="nameOnCard"
                                            label="Nombre en la Tarjeta"
                                            name="nameOnCard"
                                            type="text"
                                            placeholder="John M. Doe"
                                            value={paymentForm.nameOnCard}
                                            onChange={handlePaymentChange}
                                            required
                                            error={paymentErrors.nameOnCard}
                                        />
                                        <Input
                                            id="cardNumber"
                                            label="Número de Tarjeta"
                                            name="cardNumber"
                                            type="text"
                                            placeholder="**** **** **** 1234"
                                            value={paymentForm.cardNumber}
                                            onChange={handlePaymentChange}
                                            required
                                            error={paymentErrors.cardNumber}
                                            maxLength={19}
                                        />
                                        <div className="grid grid-cols-2 gap-3">
                                            <Input
                                                id="expiryDate"
                                                label="Expiración"
                                                name="expiryDate"
                                                type="text"
                                                placeholder="MM / AA"
                                                value={paymentForm.expiryDate}
                                                onChange={handlePaymentChange}
                                                required
                                                error={paymentErrors.expiryDate}
                                                maxLength={7}
                                            />
                                            <Input
                                                id="cvv"
                                                label="CVV"
                                                name="cvv"
                                                type="text"
                                                placeholder="123"
                                                value={paymentForm.cvv}
                                                onChange={handlePaymentChange}
                                                required
                                                error={paymentErrors.cvv}
                                                maxLength={4}
                                            />
                                        </div>
                                    </div>
                                )}

                                {isFreePlan && (
                                    <div className="flex-1 flex items-center justify-center">
                                        <p className="text-sm text-slate-500 text-center">
                                            Haga clic en "Comenzar" para activar su cuenta con el plan gratuito.
                                        </p>
                                    </div>
                                )}

                                {error && <p className="text-sm text-red-600 text-center py-2">{error}</p>}

                                {/* Summary & Actions */}
                                <div className="mt-4 pt-4 border-t border-slate-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm text-slate-600">Total mensual</span>
                                        <span className="text-lg font-bold text-slate-900">{selectedPlanDetails?.price}</span>
                                    </div>

                                    <Button
                                        type="submit"
                                        loading={isLoading}
                                        className="w-full"
                                        disabled={isLoading || !isPaymentFormValid()}
                                    >
                                        {isFreePlan ? 'Comenzar' : 'Activar Suscripción'}
                                    </Button>

                                    <button
                                        type="button"
                                        onClick={() => navigate(ROUTE_PATHS.CREATE_COMPANY)}
                                        disabled={isLoading}
                                        className="w-full mt-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                                    >
                                        ← Volver
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
};

export default SubscriptionPage;
