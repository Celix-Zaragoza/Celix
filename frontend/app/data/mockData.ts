export interface Publicacion {
  id: string;
  usuarioId: string;
  usuarioAlias: string;
  usuarioNombre: string;
  usuarioAvatar: string;
  deporte: string;
  ubicacion: string;
  contenido: string;
  imagen?: string;
  likes: number;
  comentarios: number;
  compartidos: number;
  fecha: string;
  hasLiked?: boolean;
}

export interface Evento {
  id: string;
  nombre: string;
  descripcion: string;
  deporte: string;
  fecha: string;
  hora: string;
  ubicacion: string;
  coordenadas: { lat: number; lng: number };
  participantes: number;
  maxParticipantes: number;
  imagen?: string;
}

export interface Instalacion {
  id: string;
  nombre: string;
  tipo: string;
  deportes: string[];
  direccion: string;
  coordenadas: { lat: number; lng: number };
  horario: string;
  telefono?: string;
}

export interface Mensaje {
  id: string;
  conversacionId: string;
  remitenteId: string;
  contenido: string;
  fecha: string;
  leido: boolean;
}

export interface Conversacion {
  id: string;
  participantes: {
    id: string;
    alias: string;
    nombre: string;
    avatar: string;
  }[];
  ultimoMensaje: string;
  ultimaFecha: string;
  noLeidos: number;
}

export const deportesDisponibles = [
  'Fútbol',
  'Baloncesto',
  'Tenis',
  'Pádel',
  'Running',
  'Ciclismo',
  'Natación',
  'Yoga',
  'Gimnasio',
  'Escalada',
  'Voleibol',
  'Rugby'
];

export const zonasZaragoza = [
  'Centro',
  'Delicias',
  'Universidad',
  'San José',
  'Las Fuentes',
  'Torrero',
  'Actur',
  'Casablanca',
  'Oliver',
  'Valdefierro'
];

export const mockUsuarios = [
  {
    id: '2',
    alias: 'runner_zgz',
    nombre: 'Carlos Martínez',
    email: 'carlos@example.com',
    edad: 32,
    zona: 'Actur',
    deportes: ['Running', 'Ciclismo'],
    nivelGeneral: 80,
    avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400',
    bio: '🏃 Corredor apasionado | Maratones y triatlones',
    seguidores: 521,
    siguiendo: 234,
    publicaciones: 156
  },
  {
    id: '3',
    alias: 'padel_pro',
    nombre: 'Laura Sánchez',
    email: 'laura@example.com',
    edad: 26,
    zona: 'Centro',
    deportes: ['Pádel', 'Tenis'],
    nivelGeneral: 85,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    bio: '🎾 Jugadora de pádel | Buscando compañeros de juego',
    seguidores: 689,
    siguiendo: 412,
    publicaciones: 203
  },
  {
    id: '4',
    alias: 'futbolista22',
    nombre: 'Javier López',
    email: 'javier@example.com',
    edad: 24,
    zona: 'Delicias',
    deportes: ['Fútbol', 'Gimnasio'],
    nivelGeneral: 70,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    bio: '⚽ Futbolista amateur | Real Zaragoza ❤️',
    seguidores: 423,
    siguiendo: 298,
    publicaciones: 134
  },
  {
    id: '5',
    alias: 'yoga_mindful',
    nombre: 'María Fernández',
    email: 'maria@example.com',
    edad: 30,
    zona: 'Universidad',
    deportes: ['Yoga', 'Running'],
    nivelGeneral: 75,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    bio: '🧘‍♀️ Instructora de yoga | Vida saludable',
    seguidores: 891,
    siguiendo: 367,
    publicaciones: 245
  },
  {
    id: '6',
    alias: 'ciclista_ebro',
    nombre: 'Roberto Jiménez',
    email: 'roberto@example.com',
    edad: 35,
    zona: 'Casablanca',
    deportes: ['Ciclismo', 'Running'],
    nivelGeneral: 90,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    bio: '🚴‍♂️ Ciclista de ruta | Rutas por el Ebro',
    seguidores: 1234,
    siguiendo: 456,
    publicaciones: 389
  }
];

export const mockPublicaciones: Publicacion[] = [
  {
    id: '1',
    usuarioId: '2',
    usuarioAlias: 'runner_zgz',
    usuarioNombre: 'Carlos Martínez',
    usuarioAvatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400',
    deporte: 'Running',
    ubicacion: 'Parque Grande José Antonio Labordeta',
    contenido: '¡Increíble sesión de running esta mañana! 10km en 45 minutos. El parque estaba perfecto 🏃‍♂️💨',
    imagen: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800',
    likes: 87,
    comentarios: 12,
    compartidos: 3,
    fecha: '2024-02-28T08:30:00Z',
    hasLiked: false
  },
  {
    id: '2',
    usuarioId: '3',
    usuarioAlias: 'padel_pro',
    usuarioNombre: 'Laura Sánchez',
    usuarioAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    deporte: 'Pádel',
    ubicacion: 'Club Deportivo Helios',
    contenido: '¡Buscando compañeros para partido de pádel este fin de semana! Nivel intermedio-avanzado 🎾',
    likes: 54,
    comentarios: 23,
    compartidos: 8,
    fecha: '2024-02-27T19:15:00Z',
    hasLiked: true
  },
  {
    id: '3',
    usuarioId: '4',
    usuarioAlias: 'futbolista22',
    usuarioNombre: 'Javier López',
    usuarioAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    deporte: 'Fútbol',
    ubicacion: 'Ciudad Deportiva Municipal',
    contenido: 'Partido épico hoy con el equipo. ¡Victoria 3-2! ⚽🔥 #FútbolZaragoza',
    imagen: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
    likes: 134,
    comentarios: 28,
    compartidos: 12,
    fecha: '2024-02-27T17:45:00Z',
    hasLiked: false
  },
  {
    id: '4',
    usuarioId: '5',
    usuarioAlias: 'yoga_mindful',
    usuarioNombre: 'María Fernández',
    usuarioAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    deporte: 'Yoga',
    ubicacion: 'Parque del Agua',
    contenido: 'Clase de yoga al aire libre este sábado a las 10:00. ¡Todos bienvenidos! 🧘‍♀️✨',
    imagen: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
    likes: 156,
    comentarios: 34,
    compartidos: 19,
    fecha: '2024-02-27T14:20:00Z',
    hasLiked: true
  },
  {
    id: '5',
    usuarioId: '6',
    usuarioAlias: 'ciclista_ebro',
    usuarioNombre: 'Roberto Jiménez',
    usuarioAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    deporte: 'Ciclismo',
    ubicacion: 'Vía Verde del Ebro',
    contenido: 'Ruta de 50km por la Vía Verde. Paisajes espectaculares 🚴‍♂️🌅 ¿Quién se apunta para la próxima?',
    imagen: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800',
    likes: 203,
    comentarios: 45,
    compartidos: 27,
    fecha: '2024-02-27T11:00:00Z',
    hasLiked: false
  }
];

export const mockEventos: Evento[] = [
  {
    id: '1',
    nombre: 'Carrera Popular de Zaragoza',
    descripcion: 'Carrera popular de 10km por el centro de la ciudad',
    deporte: 'Running',
    fecha: '2024-03-15',
    hora: '09:00',
    ubicacion: 'Plaza del Pilar',
    coordenadas: { lat: 41.6561, lng: -0.8773 },
    participantes: 234,
    maxParticipantes: 500,
    imagen: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800'
  },
  {
    id: '2',
    nombre: 'Torneo de Pádel Amateur',
    descripcion: 'Torneo de pádel por parejas, nivel amateur',
    deporte: 'Pádel',
    fecha: '2024-03-20',
    hora: '10:00',
    ubicacion: 'Club Helios',
    coordenadas: { lat: 41.6488, lng: -0.8891 },
    participantes: 32,
    maxParticipantes: 64
  },
  {
    id: '3',
    nombre: 'Yoga en el Parque',
    descripcion: 'Sesión de yoga al aire libre para todos los niveles',
    deporte: 'Yoga',
    fecha: '2024-03-10',
    hora: '10:00',
    ubicacion: 'Parque Grande',
    coordenadas: { lat: 41.6395, lng: -0.8995 },
    participantes: 78,
    maxParticipantes: 100,
    imagen: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'
  },
  {
    id: '4',
    nombre: 'Liga de Fútbol 7',
    descripcion: 'Inicio de la liga de fútbol 7. ¡Inscribe a tu equipo!',
    deporte: 'Fútbol',
    fecha: '2024-03-25',
    hora: '17:00',
    ubicacion: 'Ciudad Deportiva Municipal',
    coordenadas: { lat: 41.6523, lng: -0.8712 },
    participantes: 112,
    maxParticipantes: 160
  }
];

export const mockInstalaciones: Instalacion[] = [
  {
    id: '1',
    nombre: 'Ciudad Deportiva Municipal',
    tipo: 'Polideportivo',
    deportes: ['Fútbol', 'Baloncesto', 'Tenis', 'Pádel'],
    direccion: 'Av. de San José, 90',
    coordenadas: { lat: 41.6523, lng: -0.8712 },
    horario: 'L-V: 8:00-22:00, S-D: 9:00-21:00',
    telefono: '976 724 000'
  },
  {
    id: '2',
    nombre: 'Piscinas José Garcés',
    tipo: 'Piscina',
    deportes: ['Natación'],
    direccion: 'C/ Compromiso de Caspe, 52',
    coordenadas: { lat: 41.6401, lng: -0.9147 },
    horario: 'L-D: 7:00-21:00',
    telefono: '976 726 200'
  },
  {
    id: '3',
    nombre: 'Club Helios',
    tipo: 'Club privado',
    deportes: ['Pádel', 'Tenis', 'Gimnasio'],
    direccion: 'Camino de las Torres, 58',
    coordenadas: { lat: 41.6488, lng: -0.8891 },
    horario: 'L-D: 8:00-23:00',
    telefono: '976 560 000'
  },
  {
    id: '4',
    nombre: 'Parque Grande José Antonio Labordeta',
    tipo: 'Parque',
    deportes: ['Running', 'Ciclismo', 'Yoga'],
    direccion: 'Parque Grande',
    coordenadas: { lat: 41.6395, lng: -0.8995 },
    horario: '24 horas'
  },
  {
    id: '5',
    nombre: 'Rocódromo Municipal',
    tipo: 'Rocódromo',
    deportes: ['Escalada'],
    direccion: 'Parque del Agua',
    coordenadas: { lat: 41.6621, lng: -0.8556 },
    horario: 'L-V: 16:00-22:00, S-D: 10:00-14:00 y 16:00-21:00',
    telefono: '976 733 800'
  }
];

export const mockConversaciones: Conversacion[] = [
  {
    id: '1',
    participantes: [
      {
        id: '2',
        alias: 'runner_zgz',
        nombre: 'Carlos Martínez',
        avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400'
      }
    ],
    ultimoMensaje: '¿Te apuntas a la carrera del domingo?',
    ultimaFecha: '2024-02-28T10:30:00Z',
    noLeidos: 2
  },
  {
    id: '2',
    participantes: [
      {
        id: '3',
        alias: 'padel_pro',
        nombre: 'Laura Sánchez',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'
      }
    ],
    ultimoMensaje: 'Perfecto, nos vemos mañana a las 18:00',
    ultimaFecha: '2024-02-27T20:15:00Z',
    noLeidos: 0
  },
  {
    id: '3',
    participantes: [
      {
        id: '5',
        alias: 'yoga_mindful',
        nombre: 'María Fernández',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400'
      }
    ],
    ultimoMensaje: 'Gracias por la clase de yoga! 🙏',
    ultimaFecha: '2024-02-27T12:45:00Z',
    noLeidos: 1
  }
];

export const mockMensajes: { [conversacionId: string]: Mensaje[] } = {
  '1': [
    {
      id: '1',
      conversacionId: '1',
      remitenteId: '2',
      contenido: 'Hola! Vi tu publicación sobre running',
      fecha: '2024-02-28T09:00:00Z',
      leido: true
    },
    {
      id: '2',
      conversacionId: '1',
      remitenteId: '1',
      contenido: 'Hola Carlos! Sí, me encanta correr por el Parque Grande',
      fecha: '2024-02-28T09:15:00Z',
      leido: true
    },
    {
      id: '3',
      conversacionId: '1',
      remitenteId: '2',
      contenido: '¿Te apuntas a la carrera del domingo?',
      fecha: '2024-02-28T10:30:00Z',
      leido: false
    },
    {
      id: '4',
      conversacionId: '1',
      remitenteId: '2',
      contenido: 'Es a las 9:00 en Plaza del Pilar',
      fecha: '2024-02-28T10:31:00Z',
      leido: false
    }
  ],
  '2': [
    {
      id: '5',
      conversacionId: '2',
      remitenteId: '3',
      contenido: 'Hola! ¿Tienes disponibilidad para jugar al pádel mañana?',
      fecha: '2024-02-27T18:00:00Z',
      leido: true
    },
    {
      id: '6',
      conversacionId: '2',
      remitenteId: '1',
      contenido: 'Sí! ¿A qué hora te viene bien?',
      fecha: '2024-02-27T18:30:00Z',
      leido: true
    },
    {
      id: '7',
      conversacionId: '2',
      remitenteId: '3',
      contenido: 'Perfecto, nos vemos mañana a las 18:00',
      fecha: '2024-02-27T20:15:00Z',
      leido: true
    }
  ]
};
