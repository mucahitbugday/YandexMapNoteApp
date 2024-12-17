'use client'

import { useState, useEffect } from 'react'
import { Modal, Button, Offcanvas } from 'react-bootstrap'
import { List, X } from 'lucide-react'
import { YMaps, Map, Placemark } from 'react-yandex-maps'

// İstanbul varsayılan koordinatları
const defaultCenter = [41.0082, 28.9784]

export default function MapNoteApp() {
  const [note, setNote] = useState('')
  const [notes, setNotes] = useState<string[]>([])
  const [showModal, setShowModal] = useState(false)
  const [showOffcanvas, setShowOffcanvas] = useState(false)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [mapState, setMapState] = useState({ center: defaultCenter, zoom: 10 })
  const [locationError, setLocationError] = useState<string | null>(null)

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation([latitude, longitude])
          setMapState({ center: [latitude, longitude], zoom: 13 })
        },
        (error) => {
          console.error('Error getting location:', error)
          setLocationError('Konum alınamadı. Lütfen konum izinlerinizi kontrol edin.')
        }
      )
    } else {
      setLocationError('Tarayıcınız konum hizmetlerini desteklemiyor.')
    }
  }, [])

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (note.trim()) {
      setNotes([...notes, note])
      setNote('')
      setShowModal(false)
    }
  }

  const NotesContent = () => (
    <div className="d-flex flex-column h-100">
      <h3 className="mb-3">Notlarım</h3>
      {locationError && <div className="alert alert-warning">{locationError}</div>}
      <div className="flex-grow-1 overflow-auto mb-3">
        <ul className="list-group">
          {notes.map((item, index) => (
            <li key={index} className="list-group-item">
              {item}
            </li>
          ))}
        </ul>
      </div>
      <Button
        variant="primary"
        className="w-100"
        onClick={() => setShowModal(true)}
      >
        Not Ekle
      </Button>
    </div>
  )

  console.log("userLocation", userLocation)
  return (
    <div className="d-flex vh-100 vw-100">
      {/* Harita Bölümü */}
      <div className="flex-grow-1">
        <YMaps query={{ lang: 'tr_TR' }}>
          <Map state={mapState} width="100%" height="100%">
            {userLocation && (
              <Placemark
                geometry={userLocation}
                options={{
                  preset: 'islands#blueCircleDotIcon',
                  iconColor: '#0000FF'
                }}
              />
            )}
          </Map>
        </YMaps>
      </div>

      {/* Masaüstü için Notlar Bölümü */}
      <div className="d-none d-lg-flex flex-column bg-light p-3" style={{ width: '300px' }}>
        <NotesContent />
      </div>

      {/* Mobil için Menü Butonu */}
      <Button
        variant="light"
        className="d-lg-none position-absolute top-0 end-0 m-3 rounded-circle p-2"
        onClick={() => setShowOffcanvas(true)} // Offcanvas'ı açmak için
        aria-label="Menüyü aç"
      >
        <List size={24} />
      </Button>

      {/* Mobil için Notlar Offcanvas */}
      <Offcanvas
        show={showOffcanvas}
        onHide={() => setShowOffcanvas(false)}
        placement="end"
        className="d-lg-none"
      >
        <Offcanvas.Header>
          <Offcanvas.Title>Notlarım</Offcanvas.Title>
          <Button
            variant="link"
            onClick={() => setShowOffcanvas(false)} // Offcanvas'ı kapatmak için
            className="p-0"
          >
            <X size={24} />
          </Button>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <NotesContent />
        </Offcanvas.Body>
      </Offcanvas>

      {/* Not Ekleme Modalı */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Yeni Not Ekle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleNoteSubmit}>
            <div className="mb-3">
              <textarea
                className="form-control"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Notunuzu buraya yazın..."
                rows={3}
              ></textarea>
            </div>
            <Button variant="primary" type="submit">
              Kaydet
            </Button>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  )
}
