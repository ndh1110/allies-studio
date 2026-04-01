package com.allies.app.service;

import com.allies.app.model.Media;
import com.allies.app.model.Taikhoan;
import com.allies.app.repository.MediaRepository;
import com.allies.app.repository.TaikhoanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MediaService {

    @Autowired
    private MediaRepository mediaRepository;

    @Autowired
    private TaikhoanRepository taikhoanRepository;

    public Media uploadMedia(Media media, Integer uploaderId) {
        Taikhoan uploader = taikhoanRepository.findById(uploaderId)
                .orElseThrow(() -> new IllegalArgumentException("Người upload không tồn tại"));
        media.setMaTkUpload(uploader);
        return mediaRepository.save(media);
    }

    public List<Media> getMediaByUploader(Integer uploaderId) {
        Taikhoan uploader = taikhoanRepository.findById(uploaderId)
                .orElseThrow(() -> new IllegalArgumentException("Người upload không tồn tại"));
        return mediaRepository.findByMaTkUpload(uploader);
    }

    public Media getMediaById(Integer mediaId) {
        return mediaRepository.findById(mediaId)
                .orElseThrow(() -> new IllegalArgumentException("Media không tồn tại"));
    }
}