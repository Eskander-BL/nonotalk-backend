import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Menu, 
  Mic, 
  MicOff, 
  Paperclip, 
  LogOut, 
  User, 
  MessageSquare,
  AlertTriangle,
  Phone,
  Heart,
  Volume2,
  VolumeX
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useVoice } from '../hooks/useVoice'
import aiAvatarImage from '../assets/ai-avatar.png'
import './ChatPage.css'

export default function ChatPage() {
  const { user, logout, updateUser } = useAuth()
  const { isRecording, isPlaying, startRecording, stopRecording, playAudio, stopAudio } = useVoice()
  const [conversations, setConversations] = useState([])
  const [currentConversation, setCurrentConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [crisisAlert, setCrisisAlert] = useState(null)
  const [quotaWarning, setQuotaWarning] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    initializeApp()
  }, [])

  const initializeApp = async () => {
    await checkQuota()
    // Créer ou charger la conversation principale unique
    if (!currentConversation) {
      await createMainConversation()
    }
  }

  const checkQuota = async () => {
    try {
      const response = await fetch('/api/auth/check-quota', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.quota_remaining <= 2) {
          setQuotaWarning(true)
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du quota:', error)
    }
  }

  const loadConversations = async () => {
    try {
      const response = await fetch('/api/chat/conversations', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations)
        
        // Charger la première conversation ou en créer une nouvelle
        if (data.conversations.length > 0) {
          selectConversation(data.conversations[0])
        } else {
          await createMainConversation()
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error)
    }
  }

  const createMainConversation = async () => {
    try {
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ title: 'Conversation avec Nono' }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setCurrentConversation(data.conversation)
        setConversations([data.conversation])
        setMessages([])
      }
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error)
    }
  }

  const selectConversation = async (conversation) => {
    setCurrentConversation(conversation)
    
    try {
      const response = await fetch(`/api/chat/conversations/${conversation.id}/messages`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error)
    }
  }

  const sendMessage = async (messageContent, emotion = null) => {
    if (!messageContent.trim() || !currentConversation) return null

    setIsLoading(true)

    try {
      const response = await fetch(`/api/chat/conversations/${currentConversation.id}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          message: messageContent,
          emotion: emotion 
        }),
      })

      const data = await response.json()

      if (response.ok) {
        if (data.crisis_detected) {
          setCrisisAlert(data.emergency_message)
        } else {
          // Ajouter les messages à la conversation
          setMessages(prev => [...prev, data.user_message, data.ai_message])
          
          // Mettre à jour le quota utilisateur
          if (user) {
            updateUser({ ...user, quota_remaining: data.quota_remaining })
          }

          // Lire la réponse de l'IA à voix haute (sauf si appelé depuis handleVoiceRecording)
          // speakText(data.ai_message.content)
          
          return data // Retourner les données pour handleVoiceRecording
        }
      } else if (response.status === 403) {
        setQuotaWarning(true)
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error)
    } finally {
      setIsLoading(false)
    }
    
    return null
  }

  const speakText = async (text) => {
    await playAudio(text)
  }

  const handleVoiceRecording = async () => {
    if (isRecording) {
      stopRecording()
    } else {
      // Créer la conversation principale si nécessaire
      if (!currentConversation) {
        await createMainConversation()
      }
      
      // Démarrer l'enregistrement avec callback pour traiter le transcript
      await startRecording(async (transcript) => {
        if (transcript && transcript.trim()) {
          // Envoyer automatiquement le message transcrit
          const response = await sendMessage(transcript)
          // S'assurer que l'IA répond en voix après l'envoi du message
          if (response && response.ai_message) {
            await speakText(response.ai_message.content)
          }
        }
      })
    }
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file || !currentConversation) return

    const formData = new FormData()
    formData.append('image', file)

    setIsLoading(true)

    try {
      const response = await fetch(`/api/chat/conversations/${currentConversation.id}/upload-image`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setMessages(prev => [...prev, data.image_message, data.ai_message])
        
        if (user) {
          updateUser({ ...user, quota_remaining: data.quota_remaining })
        }

        speakText(data.ai_message.content)
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload d\'image:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const acknowledgeCrisis = async () => {
    try {
      await fetch('/api/chat/crisis/acknowledge', {
        method: 'POST',
        credentials: 'include'
      })
      setCrisisAlert(null)
    } catch (error) {
      console.error('Erreur lors de l\'acknowledgement de crise:', error)
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4 flex items-center justify-between shadow-lg h-16">
        <div className="flex items-center gap-3">
          <Sheet open={showSidebar} onOpenChange={setShowSidebar}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4 h-16 flex items-center">
                <h4 className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Historique de conversation
                </h4>
              </div>
              <div className="p-4 space-y-2 max-h-[calc(100vh-80px)] overflow-y-auto">
                {messages.slice(-20).map((message, index) => (
                  <Card 
                    key={`${message.id}-${index}`}
                    className="p-3 transition-colors hover:bg-gray-50"
                  >
                    <div className={`text-sm ${message.is_user ? 'text-purple-600 font-medium' : 'text-blue-700'}`}>
                     {message.is_user ? `🙋‍♂️ ${user?.username || 'Vous'}` : '👱‍♀️ Nono'}
                    </div>

                    <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {message.content}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {formatTime(message.timestamp)}
                    </div>
                  </Card>
                ))}
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 text-sm py-8">
                    Aucun message pour le moment
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
          
          <div>
            <h1 className="text-xl font-bold">NonoTalk</h1>
            <p className="text-sm opacity-90">Chat avec Nono</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium">{user?.username}</div>
            <div className="text-xs opacity-90">
              {user?.quota_remaining || 0} échanges restants
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={logout}
            className="text-white hover:bg-white/20"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

        {/* Interface principale - Avatar fixe au centre sans scrollbar */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden">
          <div className={`w-39 h-39 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center shadow-lg transition-all duration-300 ${
            isPlaying ? 'talking' : ''
          }`}>
            <img 
              src={aiAvatarImage} 
              alt="Nono" 
              className="w-35 h-35 rounded-full object-cover"
            />
          </div>
          <p className="text-center text-gray-600 text-lg font-medium px-4 mt-4">
            Je suis ton compagnon bienveillant, parle-moi librement 💜
          </p>
        </div>

      {/* Controls */}
      <div className="p-4 bg-gray-50 border-t">
        <div className="flex items-center justify-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <Button 
            onClick={() => fileInputRef.current?.click()}
            variant="outline" 
            size="icon" 
            className="w-12 h-12 rounded-full"
            disabled={isLoading || !currentConversation}
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          <Button
            onClick={handleVoiceRecording}
            disabled={isLoading || !currentConversation}
            className={`w-16 h-16 rounded-full transition-all duration-200 ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
            }`}
          >
            {isRecording ? (
              <MicOff className="h-6 w-6 text-white" />
            ) : (
              <Mic className="h-6 w-6 text-white" />
            )}
          </Button>

          {isPlaying && (
            <Button
              onClick={stopAudio}
              variant="outline"
              size="icon"
              className="w-12 h-12 rounded-full"
            >
              <VolumeX className="h-5 w-5" />
            </Button>
          )}
        </div>

        {isRecording && (
          <div className="text-center mt-2">
            <p className="text-sm text-gray-600">🎤 Enregistrement en cours...</p>
          </div>
        )}
      </div>

      {/* Crisis Alert Dialog */}
      <Dialog open={!!crisisAlert} onOpenChange={() => setCrisisAlert(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Message d'urgence
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <p className="text-sm whitespace-pre-line">{crisisAlert}</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => window.open('tel:112')}
              >
                <Phone className="h-4 w-4 mr-2" />
                Appeler 112
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => window.open('tel:0145394000')}
              >
                <Heart className="h-4 w-4 mr-2" />
                SOS Suicide
              </Button>
            </div>
            <Button 
              onClick={acknowledgeCrisis}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              J'ai compris
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quota Warning Dialog */}
      <Dialog open={quotaWarning} onOpenChange={setQuotaWarning}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              Quota bientôt épuisé
            </DialogTitle>
            <DialogDescription>
              Tu as atteint ta limite gratuite. Invite un ami pour débloquer +5 échanges gratuits pour chacun 🎁
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setQuotaWarning(false)}>
            Compris
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

