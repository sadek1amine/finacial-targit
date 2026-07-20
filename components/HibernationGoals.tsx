"use client";

import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { formatterLeMontant } from "@/lib/utils";
import { 
  Snowflake, 
  Target, 
  Calendar, 
  PlusCircle, 
  ShieldCheck, 
  Lock, 
  Sparkles,
  Layers
} from "lucide-react";

export interface HibernationGoal {
  $id: string;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  dueDate: string; // YYYY-MM-DD
  category: string;
}

interface HibernationGoalsProps {
  userId: string;
}

const HibernationGoals: React.FC<HibernationGoalsProps> = ({ userId }) => {
  const [goals, setGoals] = useState<HibernationGoal[]>([]);
  const [loading, setLoading] = useState(true);

  // حالة إضافة هدف جديد
  const [newGoal, setNewGoal] = useState({
    title: '',
    targetAmount: '',
    dueDate: '',
    category: 'Saisonnier'
  });

  // حالة الإيداع والتجميد
  const [selectedGoal, setSelectedGoal] = useState<HibernationGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>('');

  // تحميل البيانات الأولية (أو تجريبية)
  useEffect(() => {
    const loadGoals = async () => {
      setLoading(true);
      try {
        // يمكن ربطها بـ Appwrite مستقبلاً
        setGoals([
          {
            $id: "g_1",
            userId,
            title: "Assurance Automobile Annuelle",
            targetAmount: 1200,
            currentAmount: 400,
            dueDate: "2026-12-31",
            category: "Obligatoire"
          },
          {
            $id: "g_2",
            userId,
            title: "Fonds d'Urgence Glaciaire",
            targetAmount: 3000,
            currentAmount: 1800,
            dueDate: "2027-06-30",
            category: "Urgence"
          }
        ]);
      } catch (error) {
        console.error("Erreur lors du chargement des objectifs :", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) loadGoals();
  }, [userId]);

  // حساب الأقساط الشهرية المتبقية
  const calculateMonthlyTarget = (target: number, current: number, dueDateStr: string) => {
    const remainingAmount = target - current;
    if (remainingAmount <= 0) return 0;

    const today = new Date();
    const dueDate = new Date(dueDateStr);
    
    // حساب الفرق بالأشهر
    const monthsDifference = (dueDate.getFullYear() - today.getFullYear()) * 12 + (dueDate.getMonth() - today.getMonth());
    const validMonths = monthsDifference <= 0 ? 1 : monthsDifference;

    return remainingAmount / validMonths;
  };

  // إضافة هدف جديد
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title || Number(newGoal.targetAmount) <= 0 || !newGoal.dueDate) return;

    const goalObj: HibernationGoal = {
      $id: `g_${Date.now()}`,
      userId,
      title: newGoal.title,
      targetAmount: Number(newGoal.targetAmount),
      currentAmount: 0,
      dueDate: newGoal.dueDate,
      category: newGoal.category
    };

    setGoals([...goals, goalObj]);
    setNewGoal({ title: '', targetAmount: '', dueDate: '', category: 'Saisonnier' });
  };

  // تجميد مبلغ داخل الهدف
  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(depositAmount);
    if (!selectedGoal || amount <= 0) return;

    const updatedGoals = goals.map(g => {
      if (g.$id === selectedGoal.$id) {
        return { ...g, currentAmount: g.currentAmount + amount };
      }
      return g;
    });

    setGoals(updatedGoals);
    setSelectedGoal(null);
    setDepositAmount('');
  };

  // إجمالي المبالغ المجمدة
  const totalFrozen = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  // إجمالي الأهداف
  const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12 gap-2 text-cyan-600">
        <Snowflake className="animate-spin w-6 h-6" />
        <span className="text-sm font-medium">Préparation de la Grotte d'Hibernation...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8" dir="ltr">
      
      {/* 🐻‍❄️ رأس الصفحة: ملخص صندوق السبات */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl border border-cyan-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Snowflake className="w-64 h-64 text-cyan-300" />
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Polar Hibernation Fund</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-wide">
              Objectifs d'Hibernation & Épargne
            </h2>
            <p className="text-slate-300 text-sm max-w-xl">
              Protégez vos finances à long terme. Définissez vos dépenses annuelles et laissez l'application geler le montant mensuel exact.
            </p>
          </div>

          {/* عداد الإجماليات */}
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center">
              <span className="text-xs text-cyan-200 block font-medium mb-1">Total Gelé (Épargné)</span>
              <span className="text-xl md:text-2xl font-black text-cyan-400 font-mono">
                {formatterLeMontant(totalFrozen)}
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center">
              <span className="text-xs text-slate-300 block font-medium mb-1">Cible Globale</span>
              <span className="text-xl md:text-2xl font-black text-white font-mono">
                {formatterLeMontant(totalTarget)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 📊 قائمة أهداف السبات */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-5 border-b bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-600" />
            <span>Vos Objectifs d'Épargne Actifs</span>
          </h3>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-slate-100/60">
              <TableHead className="text-left">Objectif</TableHead>
              <TableHead className="text-center">Progression</TableHead>
              <TableHead className="text-right">Montant Gelé / Cible</TableHead>
              <TableHead className="text-right">Échéance</TableHead>
              <TableHead className="text-right text-cyan-700 font-bold">À Geler / Mois</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {goals.map((g) => {
              const progressPct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
              const monthlyFrozenNeeded = calculateMonthlyTarget(g.targetAmount, g.currentAmount, g.dueDate);
              const isCompleted = g.currentAmount >= g.targetAmount;

              return (
                <TableRow key={g.$id} className="hover:bg-slate-50/80 transition-colors">
                  {/* اسم الهدف والفئة */}
                  <TableCell className="p-4">
                    <div className="font-bold text-slate-800 flex items-center gap-2">
                      <Target className="w-4 h-4 text-cyan-600" />
                      {g.title}
                    </div>
                    <span className="text-xs text-slate-400 font-medium">{g.category}</span>
                  </TableCell>

                  {/* شريط التقدم */}
                  <TableCell className="p-4 min-w-[160px]">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-500">{progressPct}%</span>
                        {isCompleted && <span className="text-emerald-600 font-bold">Atteint ! 🎉</span>}
                      </div>
                      <Progress value={progressPct} className="h-2 bg-slate-100" />
                    </div>
                  </TableCell>

                  {/* المبالغ */}
                  <TableCell className="text-right font-mono p-4 font-semibold text-slate-700">
                    <span className="text-cyan-600 font-bold">{formatterLeMontant(g.currentAmount)}</span>
                    <span className="text-xs text-slate-400 block">/ {formatterLeMontant(g.targetAmount)}</span>
                  </TableCell>

                  {/* تاريخ الاستحقاق */}
                  <TableCell className="text-right p-4 text-xs font-medium text-slate-600">
                    <div className="inline-flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {g.dueDate}
                    </div>
                  </TableCell>

                  {/* المبلغ الشهري المطلوب تجميده */}
                  <TableCell className="text-right p-4 font-mono font-black text-cyan-700">
                    {isCompleted ? (
                      <span className="text-emerald-600 text-xs">Terminé</span>
                    ) : (
                      <span>{formatterLeMontant(monthlyFrozenNeeded)} /mois</span>
                    )}
                  </TableCell>

                  {/* زر التغذية */}
                  <TableCell className="p-4 text-center">
                    <Button
                      disabled={isCompleted}
                      onClick={() => setSelectedGoal(g)}
                      size="sm"
                      className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs rounded-lg shadow-sm"
                    >
                      <Lock className="w-3.5 h-3.5 mr-1" />
                      Geler des fonds
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* ➕ إنشاء هدف جديد في صندوق السبات */}
      <div className="bg-white p-6 rounded-2xl border shadow-sm max-w-2xl mx-auto">
        <h4 className="font-bold text-slate-800 mb-4 flex items-center justify-center gap-2">
          <PlusCircle className="w-5 h-5 text-cyan-600" />
          <span>Créer un Nouvel Objectif d'Hibernation</span>
        </h4>

        <form onSubmit={handleAddGoal} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-semibold text-slate-600">Nom de l'objectif</label>
            <Input
              type="text"
              placeholder="Ex: Abonnement Annuel Gym, Maintenance Voiture..."
              value={newGoal.title}
              onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Montant Cible (€)</label>
            <Input
              type="number"
              placeholder="Ex: 1200"
              value={newGoal.targetAmount}
              onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Date d'échéance</label>
            <Input
              type="date"
              value={newGoal.dueDate}
              onChange={(e) => setNewGoal({ ...newGoal, dueDate: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-semibold text-slate-600">Catégorie</label>
            <select
              value={newGoal.category}
              onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
              className="w-full border rounded-lg p-2.5 text-sm bg-white border-slate-200"
            >
              <option value="Saisonnier">Dépense Saisonnier / Annuelle</option>
              <option value="Obligatoire">Obligation / Assurance</option>
              <option value="Urgence">Fonds d'Urgence</option>
              <option value="Projet">Projet Personnel</option>
            </select>
          </div>

          <div className="md:col-span-2 pt-2">
            <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold">
              <Sparkles className="w-4 h-4 mr-2" />
              Activer cet objectif
            </Button>
          </div>
        </form>
      </div>

      {/* 🔒 نافذة التجميد السريع (Modal Geler des fonds) */}
      {selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl relative mx-4 border border-cyan-100">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2">
              <Lock className="w-5 h-5 text-cyan-600" />
              <span>Geler des fonds pour : {selectedGoal.title}</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Ce montant sera verrouillé dans la réserve d'hibernation et retiré de vos disponibilités courantes.
            </p>

            <form onSubmit={handleDeposit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Montant à injecter (€)</label>
                <Input
                  type="number"
                  placeholder="Entrez le montant"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  type="button"
                  onClick={() => {
                    setSelectedGoal(null);
                    setDepositAmount('');
                  }}
                  variant="outline"
                  className="w-full text-slate-600"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold"
                >
                  Confirmer le gel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default HibernationGoals;
