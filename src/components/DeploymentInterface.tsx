
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GitBranch, Rocket, Clock, User, CheckCircle, XCircle, Loader, Unlock } from 'lucide-react';
import { AliceChatBot } from './AliceChatBot';

interface DeploymentLog {
  id: string;
  user: string;
  timestamp: Date;
  branch: string;
  environment: string;
  status: 'success' | 'failed' | 'in-progress';
}

interface DeploymentStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
}

const DeploymentInterface = () => {
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState('origin');
  const [selectedEnvironment, setSelectedEnvironment] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentProgress, setDeploymentProgress] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockReason, setLockReason] = useState('');
  const [activeTab, setActiveTab] = useState('deploy');

  const [deploymentSteps, setDeploymentSteps] = useState<DeploymentStep[]>([
    { id: '1', name: 'Preparing deployment', status: 'pending' },
    { id: '2', name: 'Building application', status: 'pending' },
    { id: '3', name: 'Running tests', status: 'pending' },
    { id: '4', name: 'Deploying to environment', status: 'pending' },
    { id: '5', name: 'Health checks', status: 'pending' },
  ]);

  const [deploymentLogs, setDeploymentLogs] = useState<DeploymentLog[]>([
    {
      id: '1',
      user: 'Sarah Chen',
      timestamp: new Date('2024-06-11T14:30:00'),
      branch: 'feature-auth',
      environment: 'staging-3',
      status: 'success'
    },
    {
      id: '2',
      user: 'Mike Johnson',
      timestamp: new Date('2024-06-11T13:15:00'),
      branch: 'fix-payment-bug',
      environment: 'staging-1',
      status: 'failed'
    },
    {
      id: '3',
      user: 'Emma Rodriguez',
      timestamp: new Date('2024-06-11T12:00:00'),
      branch: 'main',
      environment: 'ubt',
      status: 'success'
    }
  ]);

  const branches = [
    'main',
    'develop',
    'feature-auth',
    'feature-dashboard',
    'fix-payment-bug',
    'hotfix-security'
  ];

  const origins = ['origin', 'upstream', 'fork'];

  const environments = [
    ...Array.from({ length: 14 }, (_, i) => `staging-${i + 1}`),
    'ubt'
  ];

  const handleDeploy = async () => {
    if (!selectedBranch || !selectedEnvironment) return;
    
    setIsDeploying(true);
    setDeploymentProgress(0);
    setActiveTab('steps');

    // Simulate deployment process
    const steps = [...deploymentSteps];
    for (let i = 0; i < steps.length; i++) {
      steps[i].status = 'running';
      setDeploymentSteps([...steps]);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      steps[i].status = 'completed';
      setDeploymentSteps([...steps]);
      setDeploymentProgress(((i + 1) / steps.length) * 100);
    }

    // Add to logs
    const newLog: DeploymentLog = {
      id: Date.now().toString(),
      user: 'Current User',
      timestamp: new Date(),
      branch: selectedBranch,
      environment: selectedEnvironment,
      status: 'success'
    };
    setDeploymentLogs([newLog, ...deploymentLogs]);

    setIsDeploying(false);
    
    // Reset steps for next deployment
    setTimeout(() => {
      setDeploymentSteps(steps.map(step => ({ ...step, status: 'pending' })));
      setDeploymentProgress(0);
    }, 3000);
  };

  const handleRelease = () => {
    setIsLocked(false);
    setLockReason('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'in-progress':
        return <Loader className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running':
        return <Loader className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <Rocket className="h-10 w-10 text-blue-600" />
            Alice Deployment Center
          </h1>
          <p className="text-lg text-gray-600">Deploy your code with confidence - Alice is here to help! 🚀</p>
        </div>

        {/* Main Interface */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl text-center text-gray-800">Ready to Deploy?</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="deploy">Deploy</TabsTrigger>
                <TabsTrigger value="steps">Steps</TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
              </TabsList>

              <TabsContent value="deploy" className="space-y-6">
                {/* Branch Selection */}
                <div className="space-y-3">
                  <label className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    <GitBranch className="h-5 w-5 text-blue-600" />
                    Choose your branch
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                      <Select value={selectedOrigin} onValueChange={setSelectedOrigin}>
                        <SelectTrigger className="h-12 text-base border-2 border-blue-200 hover:border-blue-300 transition-colors">
                          <SelectValue placeholder="Origin" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-2 border-blue-200">
                          {origins.map((origin) => (
                            <SelectItem key={origin} value={origin} className="hover:bg-blue-50">
                              {origin}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                        <SelectTrigger className="h-12 text-base border-2 border-blue-200 hover:border-blue-300 transition-colors">
                          <SelectValue placeholder="Select a branch to deploy" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-2 border-blue-200">
                          {branches.map((branch) => (
                            <SelectItem key={branch} value={branch} className="hover:bg-blue-50">
                              <div className="flex items-center gap-2">
                                <GitBranch className="h-4 w-4" />
                                {selectedOrigin}/{branch}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Environment Selection */}
                <div className="space-y-3">
                  <label className="text-lg font-semibold text-gray-700">
                    Pick your staging environment
                  </label>
                  <Select value={selectedEnvironment} onValueChange={setSelectedEnvironment}>
                    <SelectTrigger className="h-12 text-base border-2 border-green-200 hover:border-green-300 transition-colors">
                      <SelectValue placeholder="Where would you like to deploy?" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-green-200 max-h-60">
                      {environments.map((env) => (
                        <SelectItem key={env} value={env} className="hover:bg-green-50">
                          <div className="flex items-center gap-2">
                            <div className={`h-3 w-3 rounded-full ${env === 'ubt' ? 'bg-purple-400' : 'bg-green-400'}`} />
                            {env}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Lock Message */}
                {isLocked && (
                  <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <Unlock className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-orange-800">Deployment Locked</h3>
                        <p className="text-orange-700">{lockReason}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Deploy/Release Button */}
                <div className="text-center pt-4">
                  {isLocked ? (
                    <Button
                      onClick={handleRelease}
                      className="h-14 px-8 text-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
                    >
                      <Unlock className="h-5 w-5 mr-2" />
                      Release Lock
                    </Button>
                  ) : (
                    <Button
                      onClick={handleDeploy}
                      disabled={!selectedBranch || !selectedEnvironment || isDeploying}
                      className="h-14 px-8 text-lg bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isDeploying ? (
                        <>
                          <Loader className="h-5 w-5 mr-2 animate-spin" />
                          Deploying...
                        </>
                      ) : (
                        <>
                          <Rocket className="h-5 w-5 mr-2" />
                          Deploy Now
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Progress Bar */}
                {isDeploying && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Deployment Progress</span>
                      <span>{Math.round(deploymentProgress)}%</span>
                    </div>
                    <Progress value={deploymentProgress} className="h-3" />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="steps" className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Deployment Steps</h3>
                <div className="space-y-3">
                  {deploymentSteps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                        step.status === 'running'
                          ? 'border-blue-200 bg-blue-50'
                          : step.status === 'completed'
                          ? 'border-green-200 bg-green-50'
                          : step.status === 'failed'
                          ? 'border-red-200 bg-red-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {getStepStatusIcon(step.status)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{step.name}</p>
                        {step.status === 'running' && (
                          <p className="text-sm text-blue-600">In progress...</p>
                        )}
                        {step.status === 'completed' && (
                          <p className="text-sm text-green-600">Completed successfully</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="logs" className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Deployment History</h3>
                <div className="space-y-3">
                  {deploymentLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex-shrink-0">
                        {getStatusIcon(log.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-800">{log.user}</span>
                          <Badge variant="outline" className="text-xs">
                            {log.branch}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {log.environment}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {log.timestamp.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <Badge
                          variant={
                            log.status === 'success'
                              ? 'default'
                              : log.status === 'failed'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {log.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Alice Chatbot */}
        <AliceChatBot
          onDeploy={(branch: string, environment: string) => {
            setSelectedBranch(branch);
            setSelectedEnvironment(environment);
            setActiveTab('deploy');
          }}
        />
      </div>
    </div>
  );
};

export default DeploymentInterface;
