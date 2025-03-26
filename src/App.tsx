import { useState, useEffect } from "react";
import { InboxOutlined, CheckCircleOutlined } from "@ant-design/icons";
import {
	Button,
	Upload as AntUpload,
	message,
	ConfigProvider,
	theme,
	Alert,
	Progress,
} from "antd";
import "./styles.css";

function App() {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [preview, setPreview] = useState<string | null>(null);
	const [processedImage, setProcessedImage] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		let interval: ReturnType<typeof setInterval>;
		if (isLoading) {
			interval = setInterval(() => {
				setProgress((prevProgress) => {
					if (prevProgress >= 100) {
						clearInterval(interval);
						return 100;
					}
					return prevProgress + 1;
				});
			}, 100);
		} else {
			setProgress(0);
		}
		return () => clearInterval(interval);
	}, [isLoading]);

	const handleFileSelect = async (file: File) => {
		if (file.size > 5 * 1024 * 1024) {
			message.error("L'image ne doit pas dépasser 5 Mo");
			return false;
		}
		if (!file.type.match("image/(jpeg|png)")) {
			message.error("Format d'image non supporté. Utilisez JPEG ou PNG");
			return false;
		}
		setIsUploading(true);
		setSelectedFile(file);
		setError(null);
		const reader = new FileReader();
		reader.onloadend = () => {
			setPreview(reader.result as string);
			setIsUploading(false);
		};
		reader.readAsDataURL(file);
		return false;
	};

	const handleRemoveBackground = async () => {
		if (!selectedFile) return;

		setIsLoading(true);
		setError(null);

		const formData = new FormData();
		formData.append("image", selectedFile);

		try {
			console.log("Envoi de la requête à l'API...");
			const response = await fetch("/api/remove-bg", {
				method: "POST",
				body: formData,
				headers: {
					Accept: "application/json",
				},
			});

			console.log("Statut de la réponse:", response.status);

			if (!response.ok) {
				const errorData = await response.json().catch(() => null);
				console.error("Erreur de l'API:", errorData);
				throw new Error(errorData?.error || `Erreur HTTP: ${response.status}`);
			}

			const data = await response.json();
			console.log("Réponse reçue:", data);

			if (!data.no_bg_image_url) {
				throw new Error("L'URL de l'image traitée n'a pas été reçue");
			}

			setProcessedImage(data.no_bg_image_url);
		} catch (err) {
			console.error("Erreur lors du traitement:", err);
			setError(
				err instanceof Error
					? err.message
					: "Une erreur est survenue lors de la communication avec le serveur"
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleDownload = () => {
		if (!processedImage) return;

		const a = document.createElement("a");
		a.href = processedImage;
		a.download = "image-sans-fond.png";
		a.rel = "noopener noreferrer";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	};

	const handleDelete = () => {
		setSelectedFile(null);
		setPreview(null);
		setProcessedImage(null);
	};

	const uploadProps = {
		beforeUpload: handleFileSelect,
		showUploadList: false,
		accept: "image/jpeg,image/png",
		disabled: isUploading,
	};

	return (
		<ConfigProvider
			theme={{
				algorithm: theme.darkAlgorithm,
				token: {
					colorPrimary: "#3b82f6",
					borderRadius: 16,
				},
			}}
		>
			<div className="main-container">
				<div className="card-container">
					<div className="content-container">
						<h1 className="title">BG Wiper</h1>
						<AntUpload.Dragger {...uploadProps} className="upload-area">
							<InboxOutlined className="upload-icon" />
							<p className="upload-text">
								Cliquez ou glissez-déposez une image ici
							</p>
							<p className="upload-hint">
								Supporte les formats JPEG et PNG jusqu'à 5 Mo
							</p>
							<p className="quality-message">
								Qualité de l'image conservée à 100%
								<CheckCircleOutlined className="quality-icon" />
							</p>
						</AntUpload.Dragger>

						{error && (
							<Alert
								message="Erreur"
								description={error}
								type="error"
								showIcon
								className="error-alert"
							/>
						)}

						{isLoading && (
							<div className="progress-container">
								<Progress
									percent={progress}
									status="active"
									strokeColor={{
										from: "#3b82f6",
										to: "#2563eb",
									}}
								/>
								<div className="loading-text">Traitement en cours...</div>
							</div>
						)}

						{preview && (
							<div className="preview-container">
								<img src={preview} alt="Aperçu" className="preview-image" />
								<Button
									type="primary"
									onClick={handleRemoveBackground}
									loading={isLoading}
									className="remove-button"
								>
									Supprimer le fond
								</Button>
							</div>
						)}

						{processedImage && (
							<div className="preview-container">
								<img
									src={processedImage}
									alt="Image traitée"
									className="preview-image"
								/>
								<div className="success-message">
									<CheckCircleOutlined /> Fond supprimé avec succès !
								</div>
								<div className="quality-message">
									Qualité de l'image conservée à 100%
									<CheckCircleOutlined className="quality-icon" />
								</div>
								<Button
									type="primary"
									onClick={handleDownload}
									className="download-button"
								>
									Télécharger
								</Button>
								<Button danger onClick={handleDelete} className="delete-button">
									Supprimer
								</Button>
							</div>
						)}

						<a
							href="https://www.marius-djenontin.com"
							target="_blank"
							rel="noopener noreferrer"
							className="dedication-link"
						>
							Fait avec ❤️ par MariusDev
						</a>
					</div>
				</div>
			</div>
		</ConfigProvider>
	);
}

export default App;
